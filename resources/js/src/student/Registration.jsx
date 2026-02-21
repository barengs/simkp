import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Plus, Trash2, UserPlus, Info, CheckCircle, FileText, Users, Building, HelpCircle, Search as SearchIcon, Calendar, User } from "lucide-react";
import { fetchThemes } from "../store/slice/themeSlice";
import { fetchPeriods } from "../store/slice/periodSlice";
import { fetchCompanies } from "../store/slice/companySlice";
import { fetchStudents } from "../store/slice/studentSlice";
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
        if (dynamicMembers.length < 3) {
            setDynamicMembers([...dynamicMembers, { id: Date.now(), search: "", selected: null }]);
        } else {
            toast.warning("Maksimal 3 anggota tambahan.");
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
        if (step === 2 && (!formData.themeId || !formData.periodId)) {
            toast.error("Pilih tema dan periode terlebih dahulu.");
            return;
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

        if (myInternship) {
            return (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-green-50 border border-green-200 rounded-3xl p-8 mb-8 flex items-center gap-6">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-100">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-green-900 leading-tight">Anda Sudah Terdaftar!</h3>
                            <p className="text-green-700 mt-1 font-medium">Pendaftaran Kerja Praktek Anda telah diterima dan sedang diproses.</p>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Detail Penempatan</span>
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-widest">{myInternship.status}</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900">{myInternship.company?.name || myInternship.company_name_manual}</h4>
                            <p className="text-gray-500 text-sm mt-1">{myInternship.company?.address || myInternship.company_address_manual}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <section className="p-8 border-b md:border-b-0 md:border-r border-gray-100">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Anggota Kelompok</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">K</div>
                                        <div className="min-w-0">
                                            <p className="text-gray-900 font-bold text-sm truncate">{myInternship.leader?.name}</p>
                                            <p className="text-[10px] text-indigo-500 font-bold tracking-tight">{myInternship.leader?.nim} • Ketua</p>
                                        </div>
                                    </div>
                                    {myInternship.students?.filter(s => s.id !== myInternship.leader_id).map((student, i) => (
                                        <div key={student.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 2}</div>
                                            <div className="min-w-0">
                                                <p className="text-gray-900 font-bold text-sm truncate">{student.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold tracking-tight">{student.nim}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="p-8 space-y-6">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Tema KP</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                            <HelpCircle size={16} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-700 font-bold text-sm">{myInternship.theme?.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Periode</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                            <Calendar size={16} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-700 font-bold text-sm">{myInternship.period ? `${myInternship.period.semester} ${myInternship.period.academic_year}` : "-"}</p>
                                    </div>
                                </div>
                                {myInternship.supervisor && (
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Dosen Pembimbing</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                                <User size={16} className="text-indigo-500" />
                                            </div>
                                            <p className="text-indigo-600 font-bold text-sm">{myInternship.supervisor?.name}</p>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            );
        }

        switch (step) {
            case 1:
                return (
                    <div className="animate-in fade-in duration-500">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <Building className="text-indigo-600" />
                            Pilih Perusahaan atau Ajukan Baru
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {companies.map((company) => (
                                <div
                                    key={company.id}
                                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 transform ${formData.companyId == company.id.toString()
                                        ? "border-indigo-500 bg-indigo-50 scale-[1.02] shadow-md"
                                        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                                        }`}
                                    onClick={() => setFormData({ ...formData, companyId: company.id.toString() })}
                                >
                                    <h4 className="font-bold text-gray-900">{company.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{company.address}</p>
                                    <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                                        <span>{company.contact_person}</span>
                                        <span>{company.phone}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <input
                                    type="radio"
                                    id="newCompany"
                                    name="companyOption"
                                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                                    checked={formData.companyId === "new"}
                                    onChange={() => setFormData({ ...formData, companyId: "new" })}
                                />
                                <label htmlFor="newCompany" className="text-lg font-medium text-gray-700 cursor-pointer">
                                    Gunakan Perusahaan Lain (Baru)
                                </label>
                            </div>

                            {formData.companyId === "new" && (
                                <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nama Perusahaan/Instansi*</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                                            placeholder="Contoh: PT. Teknologi Maju"
                                            value={formData.newCompanyName}
                                            onChange={(e) => setFormData({ ...formData, newCompanyName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Alamat Lengkap*</label>
                                        <textarea
                                            rows="3"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm resize-none"
                                            placeholder="Alamat lengkap instansi..."
                                            value={formData.newCompanyAddress}
                                            onChange={(e) => setFormData({ ...formData, newCompanyAddress: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Person*</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                                                placeholder="Nama penanggung jawab"
                                                value={formData.newCompanyContact}
                                                onChange={(e) => setFormData({ ...formData, newCompanyContact: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">No. Telepon/WA*</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                                                placeholder="081xxx"
                                                value={formData.newCompanyPhone}
                                                onChange={(e) => setFormData({ ...formData, newCompanyPhone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="animate-in fade-in duration-500">
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
                                    const isActive = period.is_active || period.active; // Handle different naming
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
                                            {isActive && (
                                                <div className="absolute top-0 right-0">
                                                    <span className="bg-green-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-widest">Aktif</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start">
                                                <p className={`font-semibold ${isActive ? "text-gray-900" : "text-gray-600"}`}>{period.semester} {period.academic_year}</p>
                                                {formData.periodId == period.id.toString() && <CheckCircle size={18} className="text-indigo-600 shrink-0" />}
                                            </div>
                                            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                                <span className="bg-white/80 border border-gray-100 px-2 py-0.5 rounded italic">{period.start_date}</span>
                                                <span>s/d</span>
                                                <span className="bg-white/80 border border-gray-100 px-2 py-0.5 rounded italic">{period.end_date}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <Users className="text-indigo-600" />
                                Pilih Anggota Kelompok
                            </h3>
                            <button
                                onClick={addMemberInput}
                                disabled={dynamicMembers.length >= 3}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-200 transition-all disabled:opacity-50"
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
                                    Anda adalah <strong>Ketua Kelompok</strong> (Otomatis Terdaftar). Anda dapat menambahkan hingga 3 anggota tambahan menggunakan NIM mereka.
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
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200 pt-1">
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
                    </div>
                );
            case 4:
                return (
                    <div className="animate-in fade-in duration-500">
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
                    </div>
                );
            case 5:
                const selCompany = formData.companyId === "new" ? { name: formData.newCompanyName } : companies.find(c => c.id.toString() === formData.companyId);
                const selTheme = themes.find(t => t.id.toString() === formData.themeId);
                const selPeriod = periods.find(p => p.id.toString() === formData.periodId);

                return (
                    <div className="animate-in fade-in duration-500">
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
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header Section */}
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-extrabold tracking-tight">Pendaftaran Kerja Praktek</h2>
                        <p className="mt-2 text-indigo-100 text-sm font-medium opacity-90">Sistem Informasi Manajemen Kerja Praktek</p>
                    </div>
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full opacity-20 transform scale-150"></div>
                </div>

                {!myInternship && (
                    <div className="border-b border-gray-100 px-8 py-6">
                        <div className="flex items-center justify-between">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <React.Fragment key={item}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${step === item
                                            ? "bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100 scale-110"
                                            : step > item
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-100 text-gray-400"
                                            }`}>
                                            {step > item ? "✓" : item}
                                        </div>
                                    </div>
                                    {item < 5 && (
                                        <div className={`flex-1 h-1 mx-4 rounded transition-all duration-700 ${step > item ? "bg-green-500" : "bg-gray-100"}`}></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            <span className={step === 1 ? "text-indigo-600" : ""}>Instansi</span>
                            <span className={step === 2 ? "text-indigo-600" : ""}>Topik</span>
                            <span className={step === 3 ? "text-indigo-600" : ""}>Anggota</span>
                            <span className={step === 4 ? "text-indigo-600" : ""}>Dokumen</span>
                            <span className={step === 5 ? "text-indigo-600" : ""}>Konfirmasi</span>
                        </div>
                    </div>
                )}

                {/* Step Content */}
                <div className="p-8 min-h-[500px]">
                    {renderStepContent()}
                </div>

                {/* Footer Actions - Only show if not registered */}
                {!myInternship && !isCheckingStatus && (
                    <div className="px-8 py-6 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                        <button
                            onClick={prevStep}
                            disabled={step === 1 || internshipLoading}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${step === 1
                                ? "bg-transparent text-gray-300 cursor-not-allowed"
                                : "bg-white text-gray-700 border border-gray-200 hover:bg-white hover:shadow-md active:scale-95"
                                }`}
                        >
                            Sebelumnya
                        </button>

                        <div className="flex items-center gap-4">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest hidden sm:block">Langkah {step} dari 5</p>
                            {step < 5 ? (
                                <button
                                    onClick={nextStep}
                                    className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold font-inter shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                                >
                                    Lanjutkan
                                </button>
                            ) : (
                                <button
                                    onClick={submitRegistration}
                                    disabled={internshipLoading}
                                    className="px-10 py-3 bg-green-600 text-white rounded-xl font-bold font-inter shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 disabled:opacity-50 flex items-center gap-2 transition-all"
                                >
                                    {internshipLoading && (
                                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    {internshipLoading ? "Mengirim Data..." : "Kirim Sekarang"}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Help/Support Text */}
            <p className="text-center mt-6 text-xs text-gray-400 flex items-center justify-center gap-1 font-inter">
                <Info size={14} /> Butuh bantuan dalam proses pendaftaran? Hubungi Admin Koordinator KP.
            </p>
        </div>
    );
};

export default Registration;
