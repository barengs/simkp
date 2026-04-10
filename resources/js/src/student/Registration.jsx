import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Plus, Trash2, UserPlus, Info, CheckCircle, FileText, Users, Building, HelpCircle, Search as SearchIcon, Calendar, User } from "lucide-react";
import { fetchThemes } from "../store/slice/themeSlice";
import { fetchPeriods } from "../store/slice/periodSlice";
import { fetchCompanies } from "../store/slice/companySlice";
import { fetchStudents } from "../store/slice/studentSlice";
import { fetchPublicSettings } from "../store/slice/settingSlice";
import {
    registerInternship,
    resetRegistrationStatus,
    fetchMyInternship // Tambahkan ini agar tidak error 'not defined'
} from "../store/slice/internshipSlice";

const Registration = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { data: themes } = useSelector((state) => state.themes);
    const { data: periods } = useSelector((state) => state.periods);
    const { data: companies } = useSelector((state) => state.companies);
    const { data: students } = useSelector((state) => state.students);
    const { publicSettings } = useSelector((state) => state.settings);
    const { data: myInternship, loading: internshipLoading, error: internshipError, registrationSuccess } = useSelector((state) => state.internships);

    const [step, setStep] = useState(1); // 1: Company, 2: Theme & Period, 3: Members, 4: Documents, 5: Review
    const [formData, setFormData] = useState({
        companyId: "",
        newCompanyName: "",
        newCompanyAddress: "",
        newCompanyContact: "",
        newCompanyPhone: "",
        themeId: "",
        periodId: "",
        members: [], // List of student IDs (npm)
        documents: {
            proposal: null,
            krs: null,
            ktp: null,
            recommendationLetter: null,
        },
    });

    // States for dynamic member inputs
    const [dynamicMembers, setDynamicMembers] = useState([]); // [{id, search, selected: null}]
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    useEffect(() => {
        dispatch(fetchThemes());
        dispatch(fetchPeriods());
        dispatch(fetchCompanies());
        dispatch(fetchStudents());
        dispatch(fetchPublicSettings());
        dispatch(fetchMyInternship()).finally(() => setIsCheckingStatus(false));
    }, [dispatch]);

    useEffect(() => {
        if (registrationSuccess) {
            toast.success("Pendaftaran KP berhasil dikirim!");
            dispatch(resetRegistrationStatus());
            dispatch(fetchMyInternship());
            setStep(1);
            // Reset form
            setFormData({
                companyId: "",
                newCompanyName: "",
                newCompanyAddress: "",
                newCompanyContact: "",
                newCompanyPhone: "",
                themeId: "",
                periodId: "",
                members: [],
                documents: {
                    proposal: null,
                    krs: null,
                    ktp: null,
                    recommendationLetter: null,
                },
            });
            setDynamicMembers([]);
        }
        if (internshipError) {
            toast.error(internshipError);
        }
    }, [registrationSuccess, internshipError, dispatch]);

    const addMemberInput = () => {
        const maxMembers = parseInt(publicSettings.max_group_members) || 3;
        const maxAdditional = maxMembers - 1;

        if (dynamicMembers.length < maxAdditional) {
            setDynamicMembers([...dynamicMembers, { id: Date.now(), search: "", selected: null }]);
        } else {
            toast.warning(`Maksimal ${maxAdditional} anggota tambahan.`);
        }
    };

    const removeMemberInput = (id) => {
        const updated = dynamicMembers.filter(m => m.id !== id);
        setDynamicMembers(updated);
        // Sync to formData.members
        const studentIds = updated.filter(m => m.selected).map(m => m.selected.id.toString());
        setFormData({ ...formData, members: studentIds });
    };

    const handleMemberSearch = (id, value) => {
        let selectedStudent = null;

        // Reactive check against students array if length >= 3
        if (value.length >= 3) {
            const match = students.find(s => s.nim.toLowerCase() === value.toLowerCase());
            if (match && match.id !== user?.student?.id) {
                // Check if it's already selected somewhere else
                const isAlreadySelected = dynamicMembers.some(m => m.selected?.id === match.id && m.id !== id);
                if (!isAlreadySelected) {
                    selectedStudent = match;
                }
            }
        }

        const updated = dynamicMembers.map(m => {
            if (m.id === id) {
                return { ...m, search: value, selected: selectedStudent };
            }
            return m;
        });
        setDynamicMembers(updated);

        // Sync to formData.members
        const studentIds = updated.filter(m => m.selected).map(m => m.selected.id.toString());
        setFormData({ ...formData, members: studentIds });
    };

    const selectMember = (inputId, student) => {
        // Now handled reactively inside handleMemberSearch, this is kept for click-to-select support if needed
        if (dynamicMembers.some(m => m.selected?.id === student.id)) {
            toast.warning("Mahasiswa ini sudah dipilih.");
            return;
        }

        const updated = dynamicMembers.map(m => {
            if (m.id === inputId) {
                return { ...m, search: student.nim, selected: student };
            }
            return m;
        });
        setDynamicMembers(updated);

        // Sync to formData.members
        const studentIds = updated.filter(m => m.selected).map(m => m.selected.id.toString());
        setFormData({ ...formData, members: studentIds });
    };

    const handleFileChange = (documentType, file) => {
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran file maksimal 5MB");
                return;
            }
            // Basic extension check
            const ext = file.name.split('.').pop().toLowerCase();
            const dangerous = ['php', 'js', 'sh', 'exe', 'bat', 'cmd'];
            if (dangerous.includes(ext) || file.name.toLowerCase().includes('.php.')) {
                toast.error("Ekstensi file tidak diizinkan untuk alasan keamanan.");
                return;
            }
        }
        setFormData((prev) => ({
            ...prev,
            documents: {
                ...prev.documents,
                [documentType]: file,
            },
        }));
    };

    const nextStep = () => {
        if (step === 1 && !formData.companyId) {
            toast.error("Pilih perusahaan terlebih dahulu.");
            return;
        }
        if (step === 2) {
            if (!formData.themeId || !formData.periodId) {
                toast.error("Pilih tema dan periode terlebih dahulu.");
                return;
            }
            
            // Check period date range
            const selectedPeriod = periods.find(p => p.id.toString() === formData.periodId);
            if (selectedPeriod) {
                const now = new Date();
                const start = new Date(selectedPeriod.start_date);
                const end = new Date(selectedPeriod.end_date);
                // Standardize dates to midnight for comparison
                now.setHours(0,0,0,0);
                start.setHours(0,0,0,0);
                end.setHours(0,0,0,0);

                if (now < start) {
                    toast.error(`Masa pendaftaran belum dibuka (Mulai: ${selectedPeriod.start_date})`);
                    return;
                }
                if (now > end) {
                    toast.error(`Masa pendaftaran telah berakhir (Berakhir: ${selectedPeriod.end_date})`);
                    return;
                }
            }
        }
        if (step === 4 && (!formData.documents.proposal || !formData.documents.krs || !formData.documents.ktp)) {
            toast.error("Proposal, KRS, dan KTP wajib diunggah.");
            return;
        }
        if (step < 5) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const submitRegistration = () => {
        const data = new FormData();
        data.append("period_id", formData.periodId);
        data.append("theme_id", formData.themeId);

        if (formData.companyId === "new") {
            data.append("company_id", "");
            data.append("company_name_manual", formData.newCompanyName);
            data.append("company_address_manual", formData.newCompanyAddress);
            data.append("company_contact_manual", formData.newCompanyContact);
            data.append("company_phone_manual", formData.newCompanyPhone);
        } else {
            data.append("company_id", formData.companyId);
        }

        formData.members.forEach((memberId, index) => {
            if (memberId) data.append(`members[${index}]`, memberId);
        });

        if (formData.documents.proposal) data.append("proposal", formData.documents.proposal);
        if (formData.documents.krs) data.append("krs", formData.documents.krs);
        if (formData.documents.ktp) data.append("ktp", formData.documents.ktp);
        if (formData.documents.recommendationLetter)
            data.append("surat_rekomendasi", formData.documents.recommendationLetter);

        dispatch(registerInternship(data));
    };

    const renderStepContent = () => {
        if (isCheckingStatus || internshipLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Memeriksa Status Pendaftaran...</p>
                </div>
            );
        }

        if (myInternship && myInternship.status !== 'rejected') {
            return (
                <>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-5">
                        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-md shadow-green-100 mt-1">
                            <CheckCircle size={28} />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold text-green-900 leading-tight">Anda Sudah Terdaftar!</h3>
                            <p className="text-green-700 mt-1 text-sm font-medium">Pendaftaran Kerja Praktek Anda telah diterima dan sedang diproses.</p>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Detail Penempatan</span>
                             <h4 className="text-lg font-bold text-gray-900 mt-2">{myInternship.company?.name || myInternship.company_name_manual}</h4>
                                <p className="text-gray-500 text-sm mt-0.5">{myInternship.company?.address || myInternship.company_address_manual}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider border shadow-sm whitespace-nowrap ${
                                myInternship.status === 'ongoing' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                myInternship.status === 'grading' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                myInternship.status === 'finished' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                myInternship.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-green-100 text-green-700 border-green-200'
                            }`}>
                                {myInternship.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <section className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Daftar Anggota</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">K</div>
                                        <div className="min-w-0">
                                            <p className="text-gray-900 font-bold text-sm truncate">{myInternship.leader?.name}</p>
                                            <p className="text-[10px] text-blue-600 font-bold tracking-tight">{myInternship.leader?.nim} • Ketua</p>
                                        </div>
                                    </div>
                                    {myInternship.students?.filter(s => String(s.id) !== String(myInternship.leader?.id)).map((student, i) => (
                                        <div key={student.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold shrink-0">{i + 2}</div>
                                            <div className="min-w-0">
                                                <p className="text-gray-900 font-semibold text-sm truncate">{student.name}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{student.nim}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="p-6 space-y-5">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Tema KP</p>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 border border-gray-100 rounded bg-gray-50 shrink-0">
                                            <HelpCircle size={16} className="text-gray-500" />
                                        </div>
                                        <p className="text-gray-800 font-semibold text-sm leading-snug">{myInternship.theme?.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Periode Akademik</p>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 border border-blue-100 rounded bg-blue-50 shrink-0">
                                            <Calendar size={16} className="text-blue-500" />
                                        </div>
                                        <p className="text-gray-800 font-semibold text-sm">{myInternship.period ? `${myInternship.period.semester} ${myInternship.period.academic_year}` : "-"}</p>
                                    </div>
                                </div>
                                {myInternship.supervisor && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Dosen Pembimbing</p>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 border border-indigo-100 rounded bg-indigo-50 shrink-0">
                                                <User size={16} className="text-indigo-600" />
                                            </div>
                                            <p className="text-indigo-700 font-bold text-sm">{myInternship.supervisor?.name}</p>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </>
            );
        }

        switch (step) {
            case 1:
                const isNewCompany = formData.companyId === "new";
                return (
                    <>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Building size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                                Langkah 1: Pemilihan Perusahaan
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-8 ml-11">Pilih mitra perusahaan yang sudah terdaftar atau usulkan perusahaan baru jika belum tersedia.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all ${!isNewCompany && formData.companyId !== "" ? "border-blue-600 bg-blue-50/30" : "border-gray-200 hover:border-blue-200"
                                }`}>
                                <input type="radio" name="company_type" className="sr-only" checked={!isNewCompany && formData.companyId !== ""} onChange={() => setFormData({ ...formData, companyId: companies[0]?.id.toString() || "" })} />
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!isNewCompany && formData.companyId !== "" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                                            <CheckCircle size={16} />
                                        </div>
                                        <div>
                                            <p className={`font-semibold text-sm ${!isNewCompany && formData.companyId !== "" ? "text-blue-900" : "text-gray-900"}`}>Pilih Mitra Terdaftar</p>
                                            <p className="text-xs text-gray-500">Pilih dari {companies.length}+ mitra aktif kami</p>
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!isNewCompany && formData.companyId !== "" ? "border-blue-600" : "border-gray-300"}`}>
                                        {!isNewCompany && formData.companyId !== "" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                                    </div>
                                </div>
                            </label>

                            <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all ${isNewCompany ? "border-blue-600 bg-blue-50/30" : "border-gray-200 hover:border-blue-200"
                                }`}>
                                <input type="radio" name="company_type" className="sr-only" checked={isNewCompany} onChange={() => setFormData({ ...formData, companyId: "new" })} />
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isNewCompany ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                                            <Building size={16} />
                                        </div>
                                        <div>
                                            <p className={`font-semibold text-sm ${isNewCompany ? "text-blue-900" : "text-gray-900"}`}>Tambah Perusahaan Baru</p>
                                            <p className="text-xs text-gray-500">Usulkan tempat KP mandiri</p>
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isNewCompany ? "border-blue-600" : "border-gray-300"}`}>
                                        {isNewCompany && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                                    </div>
                                </div>
                            </label>
                        </div>

                        {isNewCompany ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama Perusahaan</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-gray-800"
                                            placeholder="Masukkan nama resmi perusahaan"
                                            value={formData.newCompanyName}
                                            onChange={(e) => setFormData({ ...formData, newCompanyName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Pemilik/Pimpinan Perusahaan</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-gray-800"
                                            placeholder="Nama pemilik/pimpinan perusahaan"
                                            value={formData.newCompanyContact}
                                            onChange={(e) => setFormData({ ...formData, newCompanyContact: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">No WhatsApp</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-gray-800"
                                            placeholder="Contoh: 081234567890"
                                            value={formData.newCompanyPhone}
                                            onChange={(e) => setFormData({ ...formData, newCompanyPhone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Alamat</label>
                                    <textarea
                                        rows="3"
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm resize-none text-gray-800"
                                        placeholder="Jl. Nama Jalan No. XX, Kota, Provinsi"
                                        value={formData.newCompanyAddress}
                                        onChange={(e) => setFormData({ ...formData, newCompanyAddress: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="bg-blue-50/50 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
                                    <Info className="text-blue-500 shrink-0" size={18} />
                                    <p>Perusahaan baru yang Anda usulkan akan diverifikasi terlebih dahulu oleh Koordinator KP sebelum pendaftaran dapat dilanjutkan sepenuhnya.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Pilih dari Daftar Mitra</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {companies.map((company) => (
                                        <div
                                            key={company.id}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all ${formData.companyId === company.id.toString()
                                                ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500"
                                                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                                }`}
                                            onClick={() => setFormData({ ...formData, companyId: company.id.toString() })}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-gray-900 text-sm">{company.name}</h4>
                                                {formData.companyId === company.id.toString() && <CheckCircle size={16} className="text-blue-600 shrink-0" />}
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2">{company.address}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                );
            case 2:
                return (
                    <>
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <FileText className="text-indigo-600" />
                            Pilih Tema dan Periode KP
                        </h3>

                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Pilih Tema KP*</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {themes.map((theme) => (
                                    <div
                                        key={theme.id}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.themeId == theme.id.toString()
                                            ? "border-indigo-500 bg-indigo-50 shadow-sm"
                                            : "border-gray-100 bg-gray-50 hover:bg-white hover:border-indigo-200"
                                            }`}
                                        onClick={() => setFormData({ ...formData, themeId: theme.id.toString() })}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-gray-800">{theme.name}</p>
                                            {formData.themeId == theme.id.toString() && <CheckCircle size={18} className="text-indigo-600" />}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Tahun: {theme.year}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Pilih Periode KP*</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {periods.map((period) => {
                                    const isActive = period.is_active || period.active;
                                    const nowAtMidnight = new Date();
                                    nowAtMidnight.setHours(0, 0, 0, 0);
                                    const startAtMidnight = new Date(period.start_date);
                                    startAtMidnight.setHours(0, 0, 0, 0);
                                    const endAtMidnight = new Date(period.end_date);
                                    endAtMidnight.setHours(0, 0, 0, 0);
                                    
                                    const isOpen = nowAtMidnight >= startAtMidnight && nowAtMidnight <= endAtMidnight;
                                    
                                    return (
                                        <div
                                            key={period.id}
                                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all relative overflow-hidden ${formData.periodId == period.id.toString()
                                                ? "border-indigo-500 bg-indigo-50 shadow-sm"
                                                : isActive
                                                    ? "border-green-100 bg-green-50/30 hover:bg-white hover:border-green-300"
                                                    : "border-gray-100 bg-gray-50 opacity-75 grayscale hover:grayscale-0 hover:bg-white hover:border-indigo-200"
                                                }`}
                                            onClick={() => setFormData({ ...formData, periodId: period.id.toString() })}
                                        >
                                            <div className="absolute top-0 right-0">
                                                {isOpen ? (
                                                    <span className="bg-green-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-widest">Terbuka</span>
                                                ) : (
                                                    <span className="bg-amber-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-widest">Tertutup</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <p className={`font-semibold ${isActive ? "text-gray-900" : "text-gray-600"}`}>{period.semester} {period.academic_year}</p>
                                                {formData.periodId == period.id.toString() && <CheckCircle size={18} className="text-indigo-600 shrink-0" />}
                                            </div>
                                            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                                <span className={`bg-white/80 border border-gray-100 px-2 py-0.5 rounded italic ${!isOpen ? 'text-red-400' : ''}`}>{period.start_date}</span>
                                                <span>s/d</span>
                                                <span className={`bg-white/80 border border-gray-100 px-2 py-0.5 rounded italic ${!isOpen ? 'text-red-400' : ''}`}>{period.end_date}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Validation Alert */}
                            {formData.periodId && (() => {
                                const selP = periods.find(p => p.id.toString() === formData.periodId);
                                if (!selP) return null;
                                
                                const n = new Date(); n.setHours(0,0,0,0);
                                const s = new Date(selP.start_date); s.setHours(0,0,0,0);
                                const e = new Date(selP.end_date); e.setHours(0,0,0,0);
                                
                                if (n < s) {
                                    return (
                                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Info size={20} className="text-amber-500 shrink-0" />
                                            <div>
                                                <p className="font-bold text-sm">Pendaftaran Belum Dibuka</p>
                                                <p className="text-xs mt-1">Sistem hanya mengizinkan pendaftaran pada tanggal yang telah ditentukan. Anda dapat mendaftar mulai tanggal <strong>{selP.start_date}</strong>.</p>
                                            </div>
                                        </div>
                                    );
                                }
                                if (n > e) {
                                    return (
                                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Info size={20} className="text-red-500 shrink-0" />
                                            <div>
                                                <p className="font-bold text-sm">Masa Pendaftaran Berakhir</p>
                                                <p className="text-xs mt-1">Batas akhir pendaftaran untuk periode ini adalah <strong>{selP.end_date}</strong>. Silakan hubungi admin untuk informasi lebih lanjut.</p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <Users className="text-indigo-600" />
                                Pilih Anggota Kelompok
                            </h3>
                            <button
                                onClick={addMemberInput}
                                disabled={dynamicMembers.length >= ((parseInt(publicSettings.max_group_members) || 3) - 1)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={16} />
                                Tambah Anggota
                            </button>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl mb-8 flex gap-4">
                            <Info className="text-blue-500 shrink-0" size={24} />
                            <div>
                                <p className="text-blue-800 font-medium font-inter uppercase tracking-widest text-[10px]">Peran Anda</p>
                                <p className="text-blue-900 font-bold text-lg">{user?.name}</p>
                                <p className="text-sm text-blue-700">
                                    Anda adalah <strong>Ketua Kelompok</strong> (Otomatis Terdaftar). Anda dapat menambhakan hingga {(parseInt(publicSettings.max_group_members) || 3) - 1} anggota tambahan (total {publicSettings.max_group_members || 3} orang) menggunakan NIM mereka.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Fixed Leader Row */}
                            <div className="relative bg-indigo-50/50 border-2 border-indigo-100 p-6 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-indigo-200">
                                        1
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Cari NIM Anggota</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-indigo-100/50 border border-indigo-200 rounded-xl text-indigo-900 text-sm font-semibold outline-none cursor-not-allowed"
                                                value={user?.student?.nim || ""}
                                                readOnly
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Nama Mahasiswa</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 bg-indigo-100/50 border border-indigo-200 rounded-xl text-indigo-900 text-sm font-semibold outline-none cursor-not-allowed pr-10"
                                                    value={user?.name || ""}
                                                    readOnly
                                                    disabled
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <span className="text-[10px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-md tracking-widest shadow-sm">KETUA</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-12 shrink-0"></div>{/* Spacer alignment */}
                                </div>
                            </div>

                            {/* Dynamic Member Inputs */}
                            {dynamicMembers.map((m, index) => {
                                const matchedStudents = m.search.length > 2 && !m.selected ? students.filter(s =>
                                    s.nim.toLowerCase().includes(m.search.toLowerCase()) &&
                                    s.id !== user?.student?.id &&
                                    !dynamicMembers.some(dm => dm.selected?.id === s.id && dm.id !== m.id)
                                ).slice(0, 5) : [];

                                return (
                                    <div key={m.id} className="relative bg-white border-2 border-gray-100 p-6 rounded-2xl shadow-sm hover:border-indigo-200 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-sm shrink-0">
                                                {index + 2}
                                            </div>
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                                                <div className="relative">
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cari NIM Anggota</label>
                                                    <input
                                                        type="text"
                                                        className={`w-full px-4 py-3 bg-white border ${m.selected ? 'border-green-300 ring-4 ring-green-50' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm`}
                                                        placeholder="Ketik NIM..."
                                                        value={m.search}
                                                        onChange={(e) => handleMemberSearch(m.id, e.target.value)}
                                                    />

                                                    {/* Results dropdown for partial matches */}
                                                    {!m.selected && matchedStudents.length > 0 && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50 pt-1">
                                                            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pilih Mahasiswa</div>
                                                            {matchedStudents.map((student) => (
                                                                <button
                                                                    key={student.id}
                                                                    onClick={() => selectMember(m.id, student)}
                                                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0"
                                                                >
                                                                    <div className="text-left">
                                                                        <p className="font-bold text-gray-900 text-sm">{student.nim}</p>
                                                                        <p className="text-xs text-gray-500">{student.name}</p>
                                                                    </div>
                                                                    <Plus size={16} className="text-gray-300" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nama Mahasiswa</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none ${m.selected ? 'bg-green-50/50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'}`}
                                                            placeholder={m.selected ? "" : "Otomatis terisi..."}
                                                            value={m.selected ? m.selected.name : ""}
                                                            readOnly
                                                        />
                                                        {m.selected && (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                                                                <CheckCircle size={14} className="text-green-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeMemberInput(m.id)}
                                                className="p-3 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all self-end mb-1"
                                                title="Hapus Anggota"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {dynamicMembers.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center gap-3">
                                    <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                                        <Users size={32} />
                                    </div>
                                    <p className="text-gray-400 font-medium text-sm">Belum ada anggota tambahan.</p>
                                    <p className="text-[10px] text-gray-300 uppercase font-bold tracking-tighter">Klik tombol "Tambah Anggota" untuk mencari rekan kelompok.</p>
                                </div>
                            )}
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <FileText className="text-indigo-600" />
                            Unggah Dokumen Administrasi
                        </h3>

                        <div className="space-y-6">
                            {[
                                { id: 'proposal', label: 'Proposal KP', required: true, accept: '.pdf' },
                                { id: 'krs', label: 'KRS (Aktif)', required: true, accept: '.pdf' },
                                { id: 'ktp', label: 'KTP / Identitas', required: true, accept: '.pdf,.jpg,.png,.jpeg' },
                                { id: 'recommendationLetter', label: 'Surat Rekomendasi (Opsional)', required: false, accept: '.pdf' },
                            ].map((doc) => (
                                <div key={doc.id}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {doc.label} {doc.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${formData.documents[doc.id] ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-indigo-400 bg-gray-50/50"
                                        }`}>
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            accept={doc.accept}
                                            onChange={(e) => handleFileChange(doc.id, e.target.files[0])}
                                        />
                                        <div className="text-center">
                                            {formData.documents[doc.id] ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="text-green-600" size={24} />
                                                    </div>
                                                    <p className="text-sm font-bold text-green-800">{formData.documents[doc.id].name}</p>
                                                    <p className="text-[10px] text-green-600 font-inter uppercase tracking-widest">File Berhasil Dipilih</p>
                                                    <button className="text-xs text-red-500 hover:underline z-20 font-bold mt-1" onClick={(e) => { e.stopPropagation(); handleFileChange(doc.id, null); }}>Hapus File</button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 bg-gray-100/50 rounded-full flex items-center justify-center">
                                                        <Plus className="text-gray-400" size={24} />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-600">Klik atau tarik file untuk unggah</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Format: {doc.accept} (Maks. 5MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 5:
                const selCompany = formData.companyId === "new" ? { name: formData.newCompanyName } : companies.find(c => c.id.toString() === formData.companyId);
                const selTheme = themes.find(t => t.id.toString() === formData.themeId);
                const selPeriod = periods.find(p => p.id.toString() === formData.periodId);

                return (
                    <>
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 font-inter underline decoration-indigo-200 underline-offset-8">Review Ringkasan Pendaftaran</h3>

                        <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <section className="p-8 border-b md:border-b-0 md:border-r border-gray-100">
                                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-6 pl-1">Informasi Penempatan</h4>
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                                <Building className="text-gray-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-0.5">Instansi/Perusahaan</p>
                                                <p className="text-gray-900 font-bold leading-snug">{selCompany?.name || "-"}</p>
                                                {formData.companyId === "new" && <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[8px] font-bold rounded-md uppercase tracking-widest">Pengajuan Baru</span>}
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                                <HelpCircle className="text-gray-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-0.5">Topik / Tema KP</p>
                                                <p className="text-gray-900 font-bold leading-snug">{selTheme?.name || "-"}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                                <FileText className="text-gray-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-0.5">Periode Pendaftaran</p>
                                                <p className="text-gray-900 font-bold leading-snug">{selPeriod ? `${selPeriod.semester} ${selPeriod.academic_year}` : "-"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="p-8 bg-gray-50/30">
                                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-6 pl-1">Anggota Kelompok</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-lg shadow-indigo-100">K</div>
                                            <div className="min-w-0">
                                                <p className="text-gray-900 font-bold text-sm truncate">{user?.name}</p>
                                                <p className="text-[10px] text-indigo-500 font-bold tracking-tight">{user?.student?.nim} • Ketua</p>
                                            </div>
                                        </div>
                                        {dynamicMembers.filter(m => m.selected).map((m, i) => (
                                            <div key={i} className="flex items-center gap-4 bg-white/50 p-3 rounded-2xl border border-gray-100/50">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 2}</div>
                                                <div className="min-w-0">
                                                    <p className="text-gray-900 font-bold text-sm truncate">{m.selected.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold tracking-tight">{m.selected.nim}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {dynamicMembers.filter(m => m.selected).length === 0 && (
                                            <p className="text-xs text-gray-400 italic text-center py-4 uppercase tracking-widest font-bold opacity-50">Tidak ada anggota tambahan</p>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <div className="bg-gray-50 p-8 border-t border-gray-100">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 text-center">Status Kelengkapan Berkas</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Proposal', key: 'proposal' },
                                        { label: 'KRS', key: 'krs' },
                                        { label: 'Identitas', key: 'ktp' },
                                        { label: 'S. Rekom', key: 'recommendationLetter' }
                                    ].map((doc) => {
                                        const isUploaded = !!formData.documents[doc.key];
                                        return (
                                            <div key={doc.key} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${isUploaded ? "bg-white border-green-200 text-green-600" : "bg-gray-100 border-transparent opacity-40 grayscale"}`}>
                                                <CheckCircle size={20} className={isUploaded ? "text-green-500" : "text-gray-300"} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{doc.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex gap-4">
                            <Info className="text-yellow-600 shrink-0" size={24} />
                            <p className="text-sm text-yellow-800 leading-relaxed font-inter">
                                <strong>Deklarasi:</strong> Kami menyatakan bahwa data di atas adalah benar. Pendaftaran akan dikirim ke sistem untuk proses verifikasi. Perubahan tidak dapat dilakukan setelah pengiriman.
                            </p>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-auto mx-auto py-3 px-4 sm:px-6 lg:px-8 bg-gray-50/50 min-h-screen">
            <div className="mb-8 text-center sm:text-left">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pendaftaran KP Online</h2>
                <p className="mt-2 text-gray-500 text-sm">Silakan lengkapi langkah-langkah di bawah ini untuk mengajukan kerja praktek.</p>
            </div>

            {myInternship && myInternship.status === 'rejected' && (
                <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 shadow-sm">
                    <Info className="text-red-500 shrink-0 mt-0.5" size={24} />
                    <div>
                        <h4 className="text-lg font-bold text-red-900">Pendaftaran Sebelumnya Ditolak</h4>
                        <p className="text-sm text-red-700 mt-2">Alasan penolakan: <strong className="bg-red-100 px-2 py-0.5 rounded">{myInternship.rejection_note || "-"}</strong></p>
                        <p className="text-sm text-red-700 mt-3 font-medium">Silakan lengkapi form di bawah ini untuk mengajukan ulang pendaftaran Kerja Praktek Anda.</p>
                    </div>
                </div>
            )}

            {(!myInternship || myInternship.status === 'rejected') && (
                <div className="flex justify-between items-center py-4 mb-8 max-w-2xl mx-auto relative px-4">
                    <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-200 -z-10 -translate-y-2.5"></div>
                    {[
                        { id: 1, label: 'Perusahaan' },
                        { id: 2, label: 'Tema / Periode' },
                        { id: 3, label: 'Anggota' },
                        { id: 4, label: 'Dokumen' },
                        { id: 5, label: 'Konfirmasi' }
                    ].map((item) => (
                        <div key={item.id} className="flex flex-col items-center relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 ${step === item.id
                                ? "bg-blue-600 text-white ring-4 ring-blue-100"
                                : step > item.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-400"
                                }`}>
                                {step > item.id ? "✓" : item.id}
                            </div>
                            <span className={`text-[10px] mt-3 font-medium absolute top-8 w-24 text-center ${step === item.id || step > item.id ? 'text-blue-600 font-bold' : 'text-gray-500'
                                }`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* The White Card for Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative z-20 mt-4">
                <div className="p-6 sm:p-10 min-h-[400px]">
                    {renderStepContent()}
                </div>

                {(!myInternship || myInternship.status === 'rejected') && !isCheckingStatus && (
                    <div className="px-6 sm:px-10 py-6 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                        <button
                            onClick={prevStep}
                            disabled={step === 1 || internshipLoading}
                            className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${step === 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                                }`}
                        >
                            &larr; Kembali
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-400 font-medium hidden sm:block">Simpan Draft</span>
                            {step < 5 ? (
                                <button
                                    onClick={nextStep}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
                                >
                                    Selanjutnya &rarr;
                                </button>
                            ) : (
                                <button
                                    onClick={submitRegistration}
                                    disabled={internshipLoading}
                                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {internshipLoading && (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    {internshipLoading ? "Mengirim..." : "Kirim Sekarang"}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Registration;
