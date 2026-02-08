import React, { useState, useEffect } from "react";
import { UploadCloud, Save, Send, ChevronLeft, ChevronRight, Check } from "lucide-react";
import api from "../../src/api";
import { useToast } from "../ui/Toast";
import { Skeleton } from "../ui/Skeleton";

import { useStudentDashboard } from "../context/StudentDashboardContext";

const Registration = () => {
    const { addToast } = useToast();
    const {
        companies,
        themes,
        periods,
        existingInternship,
        loading: contextLoading,
        refreshInternship,
        setExistingInternship
    } = useStudentDashboard();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        companyId: "",
        newCompanyName: "",
        newCompanyAddress: "",
        newCompanyContact: "",
        newCompanyPhone: "",
        themeId: "",
        periodId: "",
        documents: {
            proposal: null,
            krs: null,
            studentCard: null,
            recommendationLetter: null,
        },
    });

    useEffect(() => {
        if (existingInternship) {
            setFormData((prev) => ({
                ...prev,
                companyId: existingInternship.company_id?.toString() || "",
                themeId: existingInternship.theme_id?.toString() || "",
                periodId: existingInternship.period_id?.toString() || "",
            }));
        }
    }, [existingInternship]);

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
        if (step < 4) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const submitRegistration = async (status) => {
        setLoading(true);
        const data = new FormData();
        data.append("company_id", formData.companyId);
        data.append("theme_id", formData.themeId);
        data.append("period_id", formData.periodId);
        data.append("status", status);

        if (formData.companyId === "new") {
            data.append("new_company_name", formData.newCompanyName);
            data.append("new_company_address", formData.newCompanyAddress);
            data.append("new_company_contact", formData.newCompanyContact);
            data.append("new_company_phone", formData.newCompanyPhone);
        }

        if (formData.documents.proposal) data.append("proposal", formData.documents.proposal);
        if (formData.documents.krs) data.append("krs", formData.documents.krs);
        if (formData.documents.studentCard) data.append("ktm", formData.documents.studentCard);
        if (formData.documents.recommendationLetter) data.append("recommendation", formData.documents.recommendationLetter);

        try {
            const response = await api.post("/internships/register", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            addToast(response.data.message, "success");
            if (status === "submitted") {
                setStep(1);
                refreshInternship();
            }
        } catch (error) {
            const message = error.response?.data?.message || "Gagal mengirim pendaftaran";
            addToast(message, "error");
            if (error.response?.data?.errors) {
                Object.values(error.response.data.errors).forEach((err) => addToast(err[0], "error"));
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Pilih Perusahaan atau Ajukan Baru
                        </h3>

                        <div className="mb-6">
                            <h4 className="text-md font-medium text-gray-700 mb-2">
                                Pilih dari daftar perusahaan yang tersedia:
                            </h4>
                            <div className="space-y-3">
                                {companies.map((company) => (
                                    <div
                                        key={company.id}
                                        className={`p-4 border rounded-md cursor-pointer ${formData.companyId == company.id
                                            ? "border-indigo-500 bg-indigo-50"
                                            : "border-gray-300"
                                            }`}
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                companyId:
                                                    company.id.toString(),
                                            })
                                        }
                                    >
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-medium">
                                                    {company.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {company.address}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm">
                                                    {company.contact_person}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {company.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center mb-4">
                                <input
                                    type="radio"
                                    id="newCompany"
                                    name="companyOption"
                                    checked={formData.companyId === "new"}
                                    onChange={() =>
                                        setFormData({
                                            ...formData,
                                            companyId: "new",
                                        })
                                    }
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <label
                                    htmlFor="newCompany"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    Ajukan perusahaan baru
                                </label>
                            </div>

                            {formData.companyId === "new" && (
                                <div className="ml-6 space-y-4 p-4 border border-gray-300 rounded-md">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Perusahaan
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.newCompanyName}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    newCompanyName:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Nama perusahaan"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Alamat
                                        </label>
                                        <textarea
                                            value={formData.newCompanyAddress}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    newCompanyAddress:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            rows="2"
                                            placeholder="Alamat lengkap perusahaan"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Kontak Person
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    formData.newCompanyContact
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        newCompanyContact:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Nama kontak"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Telepon
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.newCompanyPhone}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        newCompanyPhone:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Nomor telepon"
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
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Pilih Tema dan Periode KP
                        </h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pilih Tema KP
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {themes.map((theme) => (
                                    <div
                                        key={theme.id}
                                        className={`p-4 border rounded-md cursor-pointer ${formData.themeId == theme.id
                                            ? "border-indigo-500 bg-indigo-50"
                                            : "border-gray-300"
                                            }`}
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                themeId: theme.id.toString(),
                                            })
                                        }
                                    >
                                        <p className="font-medium">
                                            {theme.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Tahun: {theme.year}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pilih Periode KP
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {periods.map((period) => (
                                    <div
                                        key={period.id}
                                        className={`p-4 border rounded-md cursor-pointer transition-all ${period.is_active ? 'ring-2 ring-green-100 border-green-200 hover:border-indigo-400' : 'opacity-60 bg-gray-50 cursor-not-allowed'} ${formData.periodId == period.id
                                            ? "border-indigo-500 bg-indigo-50"
                                            : "border-gray-300"
                                            }`}
                                        onClick={() => {
                                            if (period.is_active) {
                                                setFormData({
                                                    ...formData,
                                                    periodId: period.id.toString(),
                                                });
                                            } else {
                                                addToast("Periode ini sudah tidak aktif dan tidak dapat dipilih.", "warning");
                                            }
                                        }
                                        }
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    TA {period.academic_year} - {period.semester.toUpperCase()}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {period.start_date} s/d{" "}
                                                    {period.end_date}
                                                </p>
                                            </div>
                                            {period.is_active ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    Tidak Aktif
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Unggah Dokumen Administrasi
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Proposal KP{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label
                                                htmlFor="proposal-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                <span>{formData.documents.proposal ? "Ganti file" : "Unggah file"}</span>
                                                <input
                                                    id="proposal-upload"
                                                    name="proposal-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={(e) =>
                                                        handleFileChange(
                                                            "proposal",
                                                            e.target.files[0]
                                                        )
                                                    }
                                                />
                                            </label>
                                            <p className="pl-1">
                                                atau seret dan lepas
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {formData.documents.proposal ? formData.documents.proposal.name : "PDF, DOC, DOCX hingga 5MB"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    KRS (Kartu Rencana Studi){" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label
                                                htmlFor="krs-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                <span>{formData.documents.krs ? "Ganti file" : "Unggah file"}</span>
                                                <input
                                                    id="krs-upload"
                                                    name="krs-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={(e) =>
                                                        handleFileChange(
                                                            "krs",
                                                            e.target.files[0]
                                                        )
                                                    }
                                                />
                                            </label>
                                            <p className="pl-1">
                                                atau seret dan lepas
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {formData.documents.krs ? formData.documents.krs.name : "PDF, DOC, DOCX hingga 5MB"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kartu Tanda Mahasiswa{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label
                                                htmlFor="student-card-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                <span>{formData.documents.studentCard ? "Ganti file" : "Unggah file"}</span>
                                                <input
                                                    id="student-card-upload"
                                                    name="student-card-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={(e) =>
                                                        handleFileChange(
                                                            "studentCard",
                                                            e.target.files[0]
                                                        )
                                                    }
                                                />
                                            </label>
                                            <p className="pl-1">
                                                atau seret dan lepas
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {formData.documents.studentCard ? formData.documents.studentCard.name : "PDF, JPG, PNG hingga 5MB"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Surat Rekomendasi (Opsional)
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label
                                                htmlFor="recommendation-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                <span>{formData.documents.recommendationLetter ? "Ganti file" : "Unggah file"}</span>
                                                <input
                                                    id="recommendation-upload"
                                                    name="recommendation-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={(e) =>
                                                        handleFileChange(
                                                            "recommendationLetter",
                                                            e.target.files[0]
                                                        )
                                                    }
                                                />
                                            </label>
                                            <p className="pl-1">
                                                atau seret dan lepas
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {formData.documents.recommendationLetter ? formData.documents.recommendationLetter.name : "PDF, DOC, DOCX hingga 5MB"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Review Pendaftaran
                        </h3>

                        <div className="bg-gray-50 p-6 rounded-md mb-6">
                            <h4 className="text-md font-medium text-gray-900 mb-3">
                                Informasi Pendaftaran
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Perusahaan
                                    </p>
                                    <p className="font-medium">
                                        {formData.companyId === "new"
                                            ? formData.newCompanyName
                                            : companies.find(
                                                (c) =>
                                                    c.id.toString() ===
                                                    formData.companyId
                                            )?.name || "Belum dipilih"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Tema KP
                                    </p>
                                    <p className="font-medium">
                                        {themes.find(
                                            (t) =>
                                                t.id.toString() ===
                                                formData.themeId
                                        )?.name || "Belum dipilih"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Periode KP
                                    </p>
                                    <p className="font-medium">
                                        {(() => {
                                            const p = periods.find(p => p.id.toString() === formData.periodId);
                                            return p ? `TA ${p.academic_year} (${p.semester})` : "Belum dipilih";
                                        })()}
                                    </p>
                                </div>
                            </div>

                            {formData.companyId === "new" && (
                                <div className="mb-4">
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                                        Detail Perusahaan Baru
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Alamat
                                            </p>
                                            <p className="font-medium">
                                                {formData.newCompanyAddress}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Kontak Person
                                            </p>
                                            <p className="font-medium">
                                                {formData.newCompanyContact}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Telepon
                                            </p>
                                            <p className="font-medium">
                                                {formData.newCompanyPhone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <h5 className="text-sm font-medium text-gray-900 mb-2">
                                    Dokumen yang Diunggah
                                </h5>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {formData.documents.proposal && (
                                        <li>
                                            Proposal KP:{" "}
                                            {formData.documents.proposal.name}
                                        </li>
                                    )}
                                    {formData.documents.krs && (
                                        <li>
                                            KRS: {formData.documents.krs.name}
                                        </li>
                                    )}
                                    {formData.documents.studentCard && (
                                        <li>
                                            Kartu Mahasiswa:{" "}
                                            {
                                                formData.documents.studentCard
                                                    .name
                                            }
                                        </li>
                                    )}
                                    {formData.documents
                                        .recommendationLetter && (
                                            <li>
                                                Surat Rekomendasi:{" "}
                                                {
                                                    formData.documents
                                                        .recommendationLetter.name
                                                }
                                            </li>
                                        )}
                                    {!(
                                        formData.documents.proposal ||
                                        formData.documents.krs ||
                                        formData.documents.studentCard ||
                                        formData.documents.recommendationLetter
                                    ) && (
                                            <li className="text-gray-500">
                                                Belum ada dokumen yang diunggah
                                            </li>
                                        )}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-md">
                            <p className="text-sm text-yellow-700">
                                Pastikan semua informasi sudah benar sebelum
                                mengirimkan pendaftaran. Pendaftaran yang sudah
                                dikirim tidak dapat diubah.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (contextLoading) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-8 space-y-6">
                    <div className="flex justify-center">
                        <Skeleton className="w-20 h-20 rounded-full" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-1/2 mx-auto" />
                        <Skeleton className="h-4 w-2/3 mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    const isActivePeriodRegistration = existingInternship && existingInternship.period?.is_active;

    if (isActivePeriodRegistration && !['rejected', 'draft'].includes(existingInternship.status)) {
        const getStatusDisplay = (status) => {
            switch (status) {
                case 'submitted':
                    return {
                        title: "Pendaftaran Berhasil Dikirim",
                        description: "Pendaftaran Anda sedang menunggu validasi oleh admin. Silakan pantau dashboard untuk melihat update terbaru.",
                        color: "bg-blue-100 text-blue-700",
                        label: "Menunggu Validasi"
                    };
                case 'approved':
                    return {
                        title: "Pendaftaran Telah Disetujui",
                        description: "Selamat! Pendaftaran Kerja Praktek Anda telah disetujui. Admin akan segera mem-plot dosen pembimbing untuk Anda.",
                        color: "bg-green-100 text-green-700",
                        label: "Disetujui"
                    };
                case 'ongoing':
                    return {
                        title: "Kerja Praktek Sedang Berjalan",
                        description: "Anda sedang dalam masa pelaksanaan Kerja Praktek. Pastikan untuk selalu mengisi logbook secara rutin.",
                        color: "bg-purple-100 text-purple-700",
                        label: "Sedang Berjalan"
                    };
                default:
                    return {
                        title: "Status Pendaftaran",
                        description: "Anda sudah melakukan pendaftaran untuk periode ini.",
                        color: "bg-gray-100 text-gray-700",
                        label: status
                    };
            }
        };

        const display = getStatusDisplay(existingInternship.status);

        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
                            <Check className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{display.title}</h2>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            {display.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-gray-100 pt-8 mt-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Perusahaan</p>
                                <p className="text-sm font-bold text-gray-900">{existingInternship.company?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase inline-block ${display.color}`}>
                                    {display.label}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Periode</p>
                                <p className="text-sm font-bold text-gray-900">
                                    TA {existingInternship.period?.academic_year} ({existingInternship.period?.semester})
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
                {/* Progress Bar */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <div className="flex items-center">
                            <div
                                className={`flex-1 ${step >= 1 ? "bg-indigo-600" : "bg-gray-200"
                                    } h-2 rounded`}
                            ></div>
                            <div
                                className={`flex-1 ${step >= 2 ? "bg-indigo-600" : "bg-gray-200"
                                    } h-2 rounded`}
                            ></div>
                            <div
                                className={`flex-1 ${step >= 3 ? "bg-indigo-600" : "bg-gray-200"
                                    } h-2 rounded`}
                            ></div>
                            <div
                                className={`flex-1 ${step >= 4 ? "bg-indigo-600" : "bg-gray-200"
                                    } h-2 rounded`}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span
                                className={`text-sm ${step === 1
                                    ? "font-bold text-indigo-600"
                                    : "text-gray-500"
                                    }`}
                            >
                                Pilih Perusahaan
                            </span>
                            <span
                                className={`text-sm ${step === 2
                                    ? "font-bold text-indigo-600"
                                    : "text-gray-500"
                                    }`}
                            >
                                Tema & Periode
                            </span>
                            <span
                                className={`text-sm ${step === 3
                                    ? "font-bold text-indigo-600"
                                    : "text-gray-500"
                                    }`}
                            >
                                Unggah Dokumen
                            </span>
                            <span
                                className={`text-sm ${step === 4
                                    ? "font-bold text-indigo-600"
                                    : "text-gray-500"
                                    }`}
                            >
                                Review
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        {renderStepContent()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between gap-3">
                        <button
                            onClick={prevStep}
                            disabled={step === 1 || loading}
                            className={`px-4 py-2 rounded-md ${step === 1
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gray-500 text-white hover:bg-gray-600"
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1 inline" />
                            Kembali
                        </button>

                        <div className="flex gap-2">
                            <button
                                onClick={() => submitRegistration("draft")}
                                disabled={loading}
                                className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-md font-medium hover:bg-indigo-50 disabled:opacity-50 flex items-center"
                            >
                                <Save className="w-4 h-4 mr-1" />
                                {existingInternship ? "Update Draft" : "Simpan Draft"}
                            </button>

                            {step < 4 ? (
                                <button
                                    onClick={nextStep}
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                                >
                                    Lanjutkan
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => submitRegistration("submitted")}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                                >
                                    <Send className="w-4 h-4 mr-1" />
                                    Kirim Pendaftaran
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registration;
