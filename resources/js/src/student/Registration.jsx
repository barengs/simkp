import React, { useState } from "react";


const Registration = () => {
    const [step, setStep] = useState(1); // 1: Company Selection, 2: Theme Selection, 3: Document Upload, 4: Review
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

    const companies = [
        {
            id: 1,
            name: "PT. Teknologi Maju Jaya",
            address: "Jl. Sudirman No. 123, Jakarta",
            contactPerson: "Bapak Joko",
            phone: "021-12345678",
        },
        {
            id: 2,
            name: "CV. Inovasi Digital",
            address: "Jl. Gatot Subroto No. 45, Bandung",
            contactPerson: "Ibu Sari",
            phone: "022-87654321",
        },
        {
            id: 3,
            name: "PT. Solusi Kreatif",
            address: "Jl. Asia Afrika No. 78, Surabaya",
            contactPerson: "Pak Andi",
            phone: "031-12345678",
        },
    ];

    const themes = [
        { id: 1, name: "Pengembangan Web Application", year: "2024" },
        { id: 2, name: "Mobile Application Development", year: "2024" },
        { id: 3, name: "Data Science & Analytics", year: "2024" },
        { id: 4, name: "Cybersecurity Implementation", year: "2024" },
    ];

    const periods = [
        {
            id: 1,
            name: "KP Genap 2023/2024",
            startDate: "2024-02-01",
            endDate: "2024-07-31",
        },
        {
            id: 2,
            name: "KP Ganjil 2024/2025",
            startDate: "2024-08-01",
            endDate: "2024-12-31",
        },
    ];

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

    const submitRegistration = () => {
        // In a real app, this would submit the form to the backend
        alert("Pendaftaran KP berhasil dikirim untuk validasi!");
        setStep(1);
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
                                        className={`p-4 border rounded-md cursor-pointer ${
                                            formData.companyId == company.id
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
                                                    {company.contactPerson}
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
                                        className={`p-4 border rounded-md cursor-pointer ${
                                            formData.themeId == theme.id
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
                                        className={`p-4 border rounded-md cursor-pointer ${
                                            formData.periodId == period.id
                                                ? "border-indigo-500 bg-indigo-50"
                                                : "border-gray-300"
                                        }`}
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                periodId: period.id.toString(),
                                            })
                                        }
                                    >
                                        <p className="font-medium">
                                            {period.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {period.startDate} s/d{" "}
                                            {period.endDate}
                                        </p>
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
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="proposal-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                <span>Unggah file</span>
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
                                            PDF, DOC, DOCX hingga 5MB
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
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="krs-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                <span>Unggah file</span>
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
                                            PDF, DOC, DOCX hingga 5MB
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
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="student-card-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                <span>Unggah file</span>
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
                                            PDF, JPG, PNG hingga 5MB
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
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="recommendation-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                <span>Unggah file</span>
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
                                            PDF, DOC, DOCX hingga 5MB
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
                                        {periods.find(
                                            (p) =>
                                                p.id.toString() ===
                                                formData.periodId
                                        )?.name || "Belum dipilih"}
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
                                <ul className="list-disc pl-5 space-y-1">
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

    return (
        <>
            <div className="space-y-6">
                {/* Progress Bar */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <div className="flex items-center">
                            <div
                                className={`flex-1 ${
                                    step >= 1 ? "bg-indigo-600" : "bg-gray-200"
                                } h-2 rounded`}
                            ></div>
                            <div
                                className={`flex-1 ${
                                    step >= 2 ? "bg-indigo-600" : "bg-gray-200"
                                } h-2 rounded`}
                            ></div>
                            <div
                                className={`flex-1 ${
                                    step >= 3 ? "bg-indigo-600" : "bg-gray-200"
                                } h-2 rounded`}
                            ></div>
                            <div
                                className={`flex-1 ${
                                    step >= 4 ? "bg-indigo-600" : "bg-gray-200"
                                } h-2 rounded`}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span
                                className={`text-sm ${
                                    step === 1
                                        ? "font-bold text-indigo-600"
                                        : "text-gray-500"
                                }`}
                            >
                                Pilih Perusahaan
                            </span>
                            <span
                                className={`text-sm ${
                                    step === 2
                                        ? "font-bold text-indigo-600"
                                        : "text-gray-500"
                                }`}
                            >
                                Tema & Periode
                            </span>
                            <span
                                className={`text-sm ${
                                    step === 3
                                        ? "font-bold text-indigo-600"
                                        : "text-gray-500"
                                }`}
                            >
                                Unggah Dokumen
                            </span>
                            <span
                                className={`text-sm ${
                                    step === 4
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
                    <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between">
                        <button
                            onClick={prevStep}
                            disabled={step === 1}
                            className={`px-4 py-2 rounded-md ${
                                step === 1
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-500 text-white hover:bg-gray-600"
                            }`}
                        >
                            Kembali
                        </button>

                        {step < 4 ? (
                            <button
                                onClick={nextStep}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Lanjutkan
                            </button>
                        ) : (
                            <button
                                onClick={submitRegistration}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Kirim Pendaftaran
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Registration;
