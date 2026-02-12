import React, { useState, useEffect, useRef } from "react";
import { UploadCloud, Save, Send, ChevronLeft, ChevronRight, Plus, Trash2, Search, Loader2, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompanies } from "../store/slices/companySlice";
import { fetchThemes } from "../store/slices/themeSlice";
import { fetchPeriods } from "../store/slices/periodSlice";
import { fetchStudentDashboard, registerInternship, checkLocation, resetLocationStatus } from "../store/slices/internshipSlice";
import { toast } from "react-toastify";
import { Skeleton } from "../ui/Skeleton";
import { useAuth } from "../context/AuthContext";

const Registration = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();

    const { companies } = useSelector((state) => state.companies);
    const { themes } = useSelector((state) => state.themes);
    const { periods } = useSelector((state) => state.periods);
    const {
        dashboardData: existingInternship,
        dashboardFetched
    } = useSelector((state) => state.internships);

    // Check if any of the dependencies are loading
    const contextLoading = loading;

    useEffect(() => {
        dispatch(fetchStudentDashboard());
        dispatch(fetchCompanies({ perPage: 100 }));
        dispatch(fetchThemes({ perPage: 100 }));
        dispatch(fetchPeriods({ perPage: 100 }));
    }, [dispatch]);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingLocation, setCheckingLocation] = useState(false);
    const [locationStatus, setLocationStatus] = useState(null); // { available: bool, message: string }

    const [formData, setFormData] = useState({
        companyAction: "selection", // 'selection' or 'manual'
        companyId: "",
        companyNameManual: "",
        companyAddressManual: "",
        companyContactManual: "",
        companyPhoneManual: "",
        themeId: "",
        periodId: "",
        members: [], // Array of { npm, name, id }
        documents: {
            proposal: null,
            krs: null,
            studentCard: null,
            recommendationLetter: null,
        },
    });

    const validationTimeouts = React.useRef({});
    const latestFormData = React.useRef(formData);

    // Keep latestFormData in sync
    useEffect(() => {
        latestFormData.current = formData;
    }, [formData]);

    // Initialize leader
    useEffect(() => {
        if (existingInternship) {
            // Populate form if needed, or redirect to status view
            // For now, if valid existing internship, we show status view below
        } else if (user) {
            // Initialize members with leader
            if (formData.members.length === 0) {
                // Handle different user structures (direct or nested student)
                const npm = user.student?.nim || user.nim || user.username || '';
                const name = user.name || '';

                if (npm) {
                    setFormData(prev => ({
                        ...prev,
                        members: [{
                            npm: npm,
                            name: name,
                            isLeader: true,
                            isValid: true,
                            error: null,
                            isLoading: false
                        }]
                    }));
                }
            }
        }
    }, [existingInternship, user]);

    // Location Check Debounce
    useEffect(() => {
        if (formData.companyAction === 'manual' && formData.companyNameManual.length > 3 && formData.periodId) {
            setCheckingLocation(true);
            const timeoutId = setTimeout(async () => {
                try {
                    await dispatch(checkLocation({
                        company_name: formData.companyNameManual,
                        period_id: formData.periodId
                    })).unwrap();
                } catch (error) {
                    console.error("Location check failed", error);
                } finally {
                    setCheckingLocation(false);
                }
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            setCheckingLocation(false);
            dispatch(resetLocationStatus());
        }
    }, [formData.companyNameManual, formData.companyAction, formData.periodId, dispatch]);

    const handleFileChange = (documentType, file) => {
        setFormData((prev) => ({
            ...prev,
            documents: {
                ...prev.documents,
                [documentType]: file,
            },
        }));
    };

    const nextStep = () => {
        // Validation per step
        if (step === 1) {
            if (!formData.periodId) return toast.error("Pilih Periode KP terlebih dahulu");
            if (formData.companyAction === 'selection' && !formData.companyId) return toast.error("Pilih Perusahaan");
            if (formData.companyAction === 'manual') {
                if (!formData.companyNameManual) return toast.error("Isi nama perusahaan");
                if (locationStatus && !locationStatus.available) return toast.error("Lokasi sudah digunakan");
            }
        }
        if (step === 2) {
            // Members validation
            if (formData.members.length === 0) return toast.error("Minimal ada 1 anggota (Ketua)");
        }
        if (step === 3) {
            if (!formData.themeId) return toast.error("Pilih Tema KP");
        }

        if (step < 5) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const addMemberRow = () => {
        if (formData.members.length >= 3) {
            return toast.warning("Maksimal 3 anggota per kelompok");
        }
        setFormData(prev => ({
            ...prev,
            members: [...prev.members, { npm: '', name: '', isLeader: false, isValid: false, isLoading: false, error: null }]
        }));
    };

    const removeMemberRow = (index) => {
        setFormData(prev => ({
            ...prev,
            members: prev.members.filter((_, i) => i !== index)
        }));
    };

    const updateMember = (index, field, value) => {
        setFormData(prev => {
            const newMembers = [...prev.members];
            // Reset validity when NPM changes
            const updates = { [field]: value };
            if (field === 'npm') {
                updates.isValid = false;
                updates.error = null;
                updates.name = '';
                updates.isLoading = false;
            }
            newMembers[index] = { ...newMembers[index], ...updates };
            return { ...prev, members: newMembers };
        });

        if (field === 'npm') {
            // Clear existing timeout
            if (validationTimeouts.current[index]) {
                clearTimeout(validationTimeouts.current[index]);
            }
            // Set new timeout for debounce
            if (value.length >= 5) { // Minimum length to start searching
                validationTimeouts.current[index] = setTimeout(() => {
                    validateMember(index);
                }, 800); // 800ms debounce
            }
        }
    };

    const validateMember = async (index) => {
        // Clear any pending timeout when validation starts
        if (validationTimeouts.current[index]) {
            clearTimeout(validationTimeouts.current[index]);
        }

        const currentFormData = latestFormData.current;
        const member = currentFormData.members[index];
        if (!member || !member.npm) return;

        const npmToValidate = member.npm;

        // Check duplicate in current list (using latest state)
        const isDuplicate = currentFormData.members.some((m, i) => i !== index && m.npm === npmToValidate);
        if (isDuplicate) {
            setFormData(prev => {
                const newMembers = [...prev.members];
                newMembers[index].error = "NPM sudah ada di daftar ini";
                newMembers[index].isValid = false;
                return { ...prev, members: newMembers };
            });
            return;
        }

        // Set local loading
        setFormData(prev => {
            const newMembers = [...prev.members];
            newMembers[index].isLoading = true;
            newMembers[index].error = null;
            return { ...prev, members: newMembers };
        });

        try {
            // Keep direct API call here for local state management of member validation
            // or I could add another thunk, but this is fine for now as it's very specific to this form's member array
            const response = await import("../../src/api").then(m => m.default.get('/students/check', {
                params: { npm: npmToValidate, period_id: currentFormData.periodId }
            }));

            // Check if current input still matches what we validated
            if (latestFormData.current.members[index].npm !== npmToValidate) return;

            if (response.data.can_join) {
                setFormData(prev => {
                    const newMembers = [...prev.members];
                    newMembers[index] = {
                        ...newMembers[index],
                        name: response.data.student.user.name,
                        isValid: true,
                        isLoading: false,
                        error: null
                    };
                    return { ...prev, members: newMembers };
                });
            } else {
                setFormData(prev => {
                    const newMembers = [...prev.members];
                    newMembers[index].error = response.data.message;
                    newMembers[index].isValid = false;
                    newMembers[index].isLoading = false;
                    return { ...prev, members: newMembers };
                });
            }
        } catch (error) {
            // Check if current input still matches what we validated
            if (latestFormData.current.members[index].npm !== npmToValidate) return;

            setFormData(prev => {
                const newMembers = [...prev.members];
                newMembers[index].error = error.response?.data?.message || "Gagal memvalidasi NPM";
                newMembers[index].isValid = false;
                newMembers[index].isLoading = false;
                return { ...prev, members: newMembers };
            });
        }
    };

    const submitRegistration = async (status) => {
        setLoading(true);
        const data = new FormData();
        data.append("period_id", formData.periodId);
        data.append("theme_id", formData.themeId);
        data.append("status", status);
        data.append("company_action", formData.companyAction);

        if (formData.companyAction === "selection") {
            data.append("company_id", formData.companyId);
        } else {
            data.append("company_name_manual", formData.companyNameManual);
            data.append("new_company_address", formData.companyAddressManual);
        }

        // Members - exclude leader (current user) or send all? Backend handles excludes?
        // Backend: "$request->members" array of NPMs. 
        // Logic: "Collect all student IDs to be members ... $memberIds = [$student->id]; if ($request->members) ... "
        // So I should send ADDITIONAL members.
        const additionalMembers = formData.members.filter(m => !m.isLeader).map(m => m.npm);
        additionalMembers.forEach((npm, index) => {
            data.append(`members[${index}]`, npm);
        });

        if (formData.documents.proposal) data.append("proposal", formData.documents.proposal);
        if (formData.documents.krs) data.append("krs", formData.documents.krs);
        if (formData.documents.studentCard) data.append("ktm", formData.documents.studentCard);
        if (formData.documents.recommendationLetter) data.append("recommendation", formData.documents.recommendationLetter);
        try {
            const response = await dispatch(registerInternship(data)).unwrap();
            toast.success('Registration successful');
            if (status === "submitted") {
                setStep(1);
                dispatch(fetchStudentDashboard());
            }
        } catch (error) {
            const message = error.response?.data?.message || "Gagal mengirim pendaftaran";
            toast.error(error.message);
            if (error.response?.data?.errors) {
                Object.values(error.response.data.errors).forEach((err) => toast.error(err[0]));
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1: // Location & Period (Moved Period here because Location check needs Period ID)
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Langkah 1: Pilih Periode & Lokasi</h3>

                        {/* Period Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Periode KP</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {periods.map((period) => (
                                    <div
                                        key={period.id}
                                        className={`p-4 border rounded-md cursor-pointer transition-all ${period.is_active ? 'ring-2 ring-green-100 border-green-200 hover:border-indigo-400' : 'opacity-60 bg-gray-50 cursor-not-allowed'} ${formData.periodId == period.id ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
                                        onClick={() => period.is_active ? setFormData({ ...formData, periodId: period.id.toString() }) : toast.warning("Periode tidak aktif")}
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-medium">TA {period.academic_year} - {period.semester}</span>
                                            {period.is_active && <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded">Aktif</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Selection Mode */}
                        <div className="flex space-x-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" checked={formData.companyAction === 'selection'} onChange={() => setFormData({ ...formData, companyAction: 'selection' })} className="text-indigo-600 focus:ring-indigo-500" />
                                <span>Pilih dari Daftar</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" checked={formData.companyAction === 'manual'} onChange={() => setFormData({ ...formData, companyAction: 'manual' })} className="text-indigo-600 focus:ring-indigo-500" />
                                <span>Input Manual (Baru)</span>
                            </label>
                        </div>

                        {/* Location Input */}
                        {formData.companyAction === 'selection' ? (
                            <div className="grid grid-cols-1 gap-4 max-h-60 overflow-y-auto">
                                {companies.map(company => (
                                    <div key={company.id}
                                        className={`p-4 border rounded-md cursor-pointer ${formData.companyId == company.id ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
                                        onClick={() => setFormData({ ...formData, companyId: company.id.toString() })}
                                    >
                                        <p className="font-medium">{company.name}</p>
                                        <p className="text-xs text-gray-500">{company.address}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Perusahaan / Instansi</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="text"
                                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${locationStatus && !locationStatus.available ? 'border-red-300 bg-red-50 text-red-900' : ''}`}
                                            value={formData.companyNameManual}
                                            onChange={(e) => setFormData({ ...formData, companyNameManual: e.target.value })}
                                            placeholder="Contoh: PT. Inovasi Teknologi"
                                        />
                                        {checkingLocation && <div className="absolute right-3 top-2"><div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div></div>}
                                    </div>
                                    {locationStatus && (
                                        <p className={`mt-1 text-sm ${locationStatus.available ? 'text-green-600' : 'text-red-600'}`}>
                                            {locationStatus.message}
                                        </p>
                                    )}
                                </div>
                                {/* Additional manual info can be added here if backend requires, e.g. address */}
                            </div>
                        )}
                    </div>
                );
            case 2: // Members
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Langkah 2: Anggota Kelompok</h3>
                            <button
                                type="button"
                                onClick={addMemberRow}
                                disabled={formData.members.length >= 3}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Tambah Anggota
                            </button>
                        </div>

                        <div className="text-sm text-gray-500 mb-4">
                            Maksimal 3 anggota (termasuk ketua). Masukkan NPM dan tekan Enter atau klik tombol Cek untuk memvalidasi.
                        </div>

                        <div className="space-y-3">
                            {formData.members.map((member, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-white shadow-sm transition-all hover:shadow-md">
                                    <div className="flex-shrink-0 mt-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${member.isLeader ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                                            {index + 1}
                                        </div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* NPM Input */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                NPM {member.isLeader && '(Ketua)'}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    disabled={member.isLeader}
                                                    value={member.npm}
                                                    onChange={(e) => updateMember(index, 'npm', e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            validateMember(index);
                                                        }
                                                    }}
                                                    onBlur={() => !member.isLeader && member.npm && !member.isValid && validateMember(index)}
                                                    className={`block w-full px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm ${member.error
                                                        ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
                                                        : member.isValid
                                                            ? 'border-green-300 text-green-900 focus:border-green-500 focus:ring-green-500'
                                                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                                                        } ${member.isLeader ? 'bg-gray-50 text-gray-500' : ''}`}
                                                    placeholder="Masukkan NPM"
                                                />
                                                {!member.isLeader && (
                                                    <button
                                                        type="button"
                                                        onClick={() => validateMember(index)}
                                                        disabled={loading || !member.npm}
                                                        className="absolute right-2 top-1.5 p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-50"
                                                        title="Cek NPM"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {member.error && <p className="mt-1 text-xs text-red-600">{member.error}</p>}
                                        </div>

                                        {/* Name Display */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                Nama Mahasiswa
                                            </label>
                                            <div className={`block w-full px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm flex items-center ${member.name ? 'text-gray-900 font-medium' : 'text-gray-400 italic'}`}>
                                                {member.isLoading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin mr-2 text-indigo-500" />
                                                        <span className="text-gray-500">Mencari...</span>
                                                    </>
                                                ) : (
                                                    member.name || 'Menunggu validasi...'
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 mt-2">
                                        {!member.isLeader && (
                                            <button
                                                type="button"
                                                onClick={() => removeMemberRow(index)}
                                                className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 3: // Theme
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Langkah 3: Pilih Tema KP</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {themes.map((theme) => (
                                <div
                                    key={theme.id}
                                    className={`p-4 border rounded-md cursor-pointer ${formData.themeId == theme.id ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
                                    onClick={() => setFormData({ ...formData, themeId: theme.id.toString() })}
                                >
                                    <p className="font-medium">{theme.name}</p>
                                    <p className="text-sm text-gray-600">Tahun: {theme.year}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 4: // Documents
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Langkah 4: Unggah Dokumen</h3>
                        {/* Reusing existing upload UI pattern */}
                        {['proposal', 'krs', 'studentCard', 'recommendationLetter'].map((docType) => (
                            <div key={docType}>
                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                    {docType === 'studentCard' ? 'KTM' : docType} {docType !== 'recommendationLetter' && <span className="text-red-500">*</span>}
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor={`${docType}-upload`} className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                <span>{formData.documents[docType] ? "Ganti file" : "Unggah file"}</span>
                                                <input id={`${docType}-upload`} name={`${docType}-upload`} type="file" className="sr-only" onChange={(e) => handleFileChange(docType, e.target.files[0])} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">{formData.documents[docType]?.name || "PDF, DOCX max 5MB"}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 5: // Review
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Review Pendaftaran</h3>
                        <div className="bg-gray-50 p-6 rounded-md space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase">Lokasi</h4>
                                <p className="mt-1 text-lg font-semibold text-gray-900">{formData.companyAction === 'selection' ? companies.find(c => c.id == formData.companyId)?.name : formData.companyNameManual}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase">Anggota</h4>
                                <ul className="mt-1 list-disc list-inside">
                                    {formData.members.map(m => (
                                        <li key={m.npm} className="text-gray-900">{m.name} ({m.npm}) {m.isLeader && '(Ketua)'}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase">Tema & Periode</h4>
                                <p className="mt-1 text-gray-900">{themes.find(t => t.id == formData.themeId)?.name}</p>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    if (contextLoading || (!dashboardFetched && loading)) return <Skeleton className="h-96 w-full" />;

    if (existingInternship && existingInternship.status && !['rejected', 'draft'].includes(existingInternship.status)) {
        // Status View (simplified for brevity, reuse existing logic in practice)
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
                    <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900">Status: {existingInternship.status?.toUpperCase() || 'UNKNOWN'}</h2>
                    <p className="text-gray-500 mt-2">Anda terdaftar dalam kelompok.</p>
                    <div className="mt-6 border-t pt-6 text-left">
                        <h3 className="font-semibold mb-2">Anggota Kelompok:</h3>
                        <ul className="list-disc pl-5">
                            {existingInternship.leader && <li>{existingInternship.leader.user?.name} (Ketua)</li>}
                            {existingInternship.members?.map(m => (
                                <li key={m.id}>{m.student?.user?.name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                {/* Steps Indicator */}
                <div className="flex items-center justify-between">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className={`flex items-center ${s < 5 ? 'flex-1' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {s}
                            </div>
                            {s < 5 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 px-2">
                    <span>Lokasi</span><span>Anggota</span><span>Tema</span><span>Dokumen</span><span>Review</span>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                <div className="p-8">
                    {renderStepContent()}
                </div>
                <div className="bg-gray-50 px-8 py-4 flex justify-between">
                    <button onClick={prevStep} disabled={step === 1} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Kembali
                    </button>
                    {step < 5 ? (
                        <button onClick={nextStep} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                            Lanjut <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                    ) : (
                        <div className="space-x-4">
                            <button onClick={() => submitRegistration('draft')} disabled={loading} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <Save className="w-4 h-4 mr-2" /> Simpan Draft
                            </button>
                            <button onClick={() => submitRegistration('submitted')} disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                {loading ? 'Mengirim...' : <><Send className="w-4 h-4 mr-2" /> Kirim Pendaftaran</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Registration;
