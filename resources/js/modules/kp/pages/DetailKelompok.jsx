import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
    useGetKpGroupByIdQuery,
    useGetLogbookQuery,
    useUpdateLogbookMutation,
} from '../api/kpApi';

import {
    handleApiError,
    handleApiSuccess,
} from '../../shared/api/errorHandler';

import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import Statistik from '../../../components/ui/Statistik';
import Modal from '../../../components/ui/Modal';
import Textarea from '../../../components/ui/Textarea';
import ModalImage from '../../../components/ui/ModalImage';

import {
    Users,
    FileText,
    Building2,
    BookOpen,
    CalendarDays,
    GraduationCap,
    XCircle,
    ArrowLeft,
    BriefcaseBusiness,
    ClipboardList,
    Clock3,
    MapPin,
    UsersRound,
    UserRound,
    CheckCircle2,
    AlertCircle,
    Clock,
    Eye,
    Check,
    Image,
} from 'lucide-react';


/* =========================================================
   STATUS
========================================================= */

const STATUS_LABEL = {
    draft: 'Draft',
    submitted: 'Menunggu Validasi',
    pending: 'Menunggu Validasi',
    rejected: 'Ditolak',
    approved: 'Disetujui',
    revision: 'Perlu Revisi',
    ongoing: 'Berjalan',
    grading: 'Dinilai',
    finished: 'Selesai',
};


const STATUS_COLOR = {
    draft: 'gray',
    submitted: 'yellow',
    pending: 'yellow',
    rejected: 'red',
    approved: 'green',
    revision: 'red',
    ongoing: 'yellow',
    grading: 'purple',
    finished: 'green',
};


const getStatusBadge = (status) => {

    return (
        <Badge
            status={
                STATUS_COLOR[status] ||
                'gray'
            }
        >
            {
                STATUS_LABEL[status] ||
                status ||
                '-'
            }
        </Badge>
    );

};


/* =========================================================
   DATE
========================================================= */

const formatDate = (date) => {

    if (!date) return '-';

    return new Date(date).toLocaleDateString(
        'id-ID',
        {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }
    );

};


const formatShortDate = (date) => {

    if (!date) return '-';

    return new Date(date).toLocaleDateString(
        'id-ID',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }
    );

};


/* =========================================================
   DETAIL ITEM
========================================================= */

const DetailItem = ({
    icon: Icon,
    label,
    value,
    children,
}) => (

    <div className="flex gap-3">

        <div className="
            flex
            items-center
            justify-center
            w-9
            h-9
            rounded-lg
            bg-gray-50
            text-gray-500
            shrink-0
        ">
            <Icon className="w-4 h-4" />
        </div>


        <div className="min-w-0">

            <p className="
                text-xs
                font-medium
                text-gray-400
                uppercase
                tracking-wide
            ">
                {label}
            </p>

            {children || (

                <p className="
                    mt-1
                    text-sm
                    font-medium
                    text-gray-900
                    break-words
                ">
                    {value || '-'}
                </p>

            )}

        </div>

    </div>

);


/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({
    icon: Icon,
    title,
    description,
    action,
}) => (

    <div className="
        flex
        items-start
        justify-between
        gap-4
        mb-5
    ">

        <div className="
            flex
            items-start
            gap-3
        ">

            <div className="
                flex
                items-center
                justify-center
                w-9
                h-9
                rounded-lg
                bg-emerald-50
                text-emerald-600
                shrink-0
            ">
                <Icon className="w-4 h-4" />
            </div>


            <div>

                <h3 className="
                    text-base
                    font-semibold
                    text-gray-900
                ">
                    {title}
                </h3>

                {description && (
                    <p className="
                        mt-0.5
                        text-xs
                        text-gray-500
                    ">
                        {description}
                    </p>
                )}

            </div>

        </div>


        {action}

    </div>

);


/* =========================================================
   EMPTY
========================================================= */

const EmptyContent = ({
    icon: Icon,
    title,
    description,
}) => (

    <div className="
        flex
        flex-col
        items-center
        justify-center
        py-12
        text-center
    ">

        <div className="
            flex
            items-center
            justify-center
            w-12
            h-12
            rounded-full
            bg-gray-100
            mb-3
        ">
            <Icon className="
                w-6
                h-6
                text-gray-400
            " />
        </div>


        <p className="
            text-sm
            font-medium
            text-gray-700
        ">
            {title}
        </p>


        {description && (
            <p className="
                mt-1
                text-xs
                text-gray-400
                max-w-sm
            ">
                {description}
            </p>
        )}

    </div>

);


/* =========================================================
   APPROVE MODAL
========================================================= */

const ActionModal = ({
    isOpen,
    onClose,
    onConfirm,
    submitting,
}) => {

    const [
        message,
        setMessage,
    ] = useState('');


    const handleConfirm = () => {

        onConfirm(message);

        setMessage('');

    };


    const handleClose = () => {

        setMessage('');

        onClose();

    };


    return (

        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Setujui Logbook"
            size="md"
        >

            <div className="space-y-4">

                <div className="
                    rounded-xl
                    p-4
                    flex
                    gap-3
                    bg-emerald-50
                    border
                    border-emerald-200
                    text-emerald-800
                ">

                    <AlertCircle className="
                        w-5
                        h-5
                        mt-0.5
                        shrink-0
                    " />

                    <div>

                        <p className="
                            text-sm
                            font-semibold
                        ">
                            Konfirmasi validasi
                        </p>

                        <p className="
                            mt-1
                            text-xs
                            text-emerald-700
                            leading-5
                        ">
                            Pastikan aktivitas sudah diperiksa
                            dan sesuai sebelum disetujui.
                        </p>

                    </div>

                </div>


                <Textarea
                    label="Catatan Validasi"
                    value={message}
                    onChange={(e) =>
                        setMessage(
                            e.target.value
                        )
                    }
                    placeholder="Opsional: tambahkan catatan..."
                    rows={4}
                />

            </div>


            <div className="
                flex
                justify-end
                gap-3
                pt-6
            ">

                <Button
                    variant="secondary"
                    onClick={handleClose}
                >
                    Batal
                </Button>

                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    loading={submitting}
                >
                    Setujui
                </Button>

            </div>

        </Modal>

    );

};


/* =========================================================
   TIMELINE ITEM
========================================================= */

const TimelineItem = ({
    logbook,
    isLast,
    onDetail,
}) => {
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const isPending =
        logbook.status === 'pending' ||
        logbook.status === 'submitted';

    const openImage = (src, alt) => {
        if (src) {
            setSelectedImage({ src, alt });
            setShowImageModal(true);
        }
    };

    return (
        <div>
            <div className="relative flex gap-4">

                {/* LINE */}
            {!isLast && (
                <div className="
                    absolute
                    left-[17px]
                    top-9
                    bottom-[-32px]
                    w-px
                    bg-gray-200
                " />
            )}


            {/* DOT */}
            <div className="
                relative
                z-10
                flex
                items-center
                justify-center
                w-9
                h-9
                rounded-full
                bg-emerald-50
                border
                border-emerald-200
                text-emerald-600
                shrink-0
            ">

                {isPending ? (
                    <Clock className="w-4 h-4" />
                ) : (
                    <CheckCircle2 className="w-4 h-4" />
                )}

            </div>


            {/* CONTENT */}
            <div className="
                min-w-0
                flex-1
                pb-8
            ">

                {/* DATE */}
                <div className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    mb-2
                ">

                    <span className="
                        text-xs
                        font-semibold
                        text-gray-500
                    ">
                        {formatDate(logbook.date)}
                    </span>

                    {getStatusBadge(
                        logbook.status
                    )}

                </div>


                {/* CARD */}
                <div className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    p-4
                    transition
                    hover:border-emerald-300
                    hover:shadow-sm
                ">

                    {/* STUDENT */}
                    <div className="
                        flex
                        items-center
                        gap-2
                        mb-3
                    ">

                        <div className="
                            flex
                            items-center
                            justify-center
                            w-7
                            h-7
                            rounded-full
                            bg-gray-100
                            text-gray-500
                        ">
                            <UserRound className="w-3.5 h-3.5" />
                        </div>

                        <div>

                            <p className="
                                text-xs
                                font-medium
                                text-gray-900
                            ">
                                {logbook.student?.user?.name || '-'}
                            </p>

                            <p className="
                                text-[11px]
                                text-gray-400
                                font-mono
                            ">
                                {logbook.student?.nim || '-'}
                            </p>

                            {/* ATTACHMENT & EVIDENCE PHOTO LINKS */}
                            {(logbook.attachment || logbook.evidence_photo) && (
                                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                    {logbook.attachment && (
                                        <button
                                            type="button"
                                            onClick={() => openImage(
                                                logbook.attachment,
                                                'Lampiran'
                                            )}
                                            className="
                                                text-xs
                                                text-blue-600
                                                hover:text-blue-800
                                                hover:underline
                                                font-medium
                                                flex
                                                items-center
                                                gap-1
                                            "
                                        >
                                            <FileText className="w-3 h-3" />
                                            Lampiran
                                        </button>
                                    )}

                                    {logbook.evidence_photo && (
                                        <button
                                            type="button"
                                            onClick={() => openImage(
                                                logbook.evidence_photo,
                                                'Foto Bukti'
                                            )}
                                            className="
                                                text-xs
                                                text-emerald-600
                                                hover:text-emerald-800
                                                hover:underline
                                                font-medium
                                                flex
                                                items-center
                                                gap-1
                                            "
                                        >
                                            <Image className="w-3 h-3" />
                                            Foto Bukti
                                        </button>
                                    )}
                                </div>
                            )}

                        </div>

                    </div>


                    {/* ACTIVITY */}
                    <p className="
                        text-sm
                        font-medium
                        leading-6
                        text-gray-800
                        whitespace-pre-line
                        
                    ">
                        {logbook.activity || '-'}
                    </p>


                    {/* FOOTER */}
                    <div className="
                        mt-4
                        pt-3
                        border-t
                        border-gray-100
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-3
                    ">

                        <div className="
                            flex
                            items-center
                            gap-1.5
                            text-xs
                            text-gray-400
                        ">

                            <Building2 className="w-3.5 h-3.5" />

                            <span className="truncate">
                                {logbook.kp_company?.name || '-'}
                            </span>

                        </div>


                        <div className="
                            flex
                            items-center
                            gap-2
                            sm:ml-auto
                        ">
                            <Button
                                size="sm"
                                variant="secondary"
                                icon={Eye}
                                onClick={() =>
                                    onDetail(logbook)
                                }
                            >
                                Lihat detail
                            </Button>

                            {logbook.status === 'pending' || logbook.status === 'submitted' ? (
                                <Button
                                    size="sm"
                                    variant="primary"
                                    icon={Check}
                                    onClick={() =>
                                        onDetail(logbook)
                                }
                                >
                                    Setujui
                                </Button>
                            ) : null}

                        </div>


                    </div>

                </div>

            </div>

            </div>

            {/* IMAGE MODAL */}
            <ModalImage
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                imageSrc={selectedImage?.src}
                imageAlt={selectedImage?.alt}
            />
        </div>

    );

};


/* =========================================================
   TIMELINE
========================================================= */

const LogbookTimeline = ({
    logbooks,
    onDetail,
}) => {

    const sortedLogbooks = useMemo(() => {

        return [...logbooks].sort(
            (a, b) => {

                const dateA =
                    new Date(a.date || 0).getTime();

                const dateB =
                    new Date(b.date || 0).getTime();

                return dateB - dateA;

            }
        );

    }, [logbooks]);


    return (

        <div className="
            max-w-4xl
        ">

            {sortedLogbooks.map(
                (logbook, index) => (

                    <TimelineItem
                        key={logbook.id}
                        logbook={logbook}
                        isLast={
                            index ===
                            sortedLogbooks.length - 1
                        }
                        onDetail={onDetail}
                    />

                )
            )}

        </div>

    );

};


/* =========================================================
   MAIN
========================================================= */

const DetailKelompok = () => {

    const {
        id,
    } = useParams();

    const navigate =
        useNavigate();

    const auth = useSelector(state => state.auth);
    const user = auth?.user;
    const userPermissions = auth?.permissions || [];
    const hasDetailPermission = userPermissions.includes('kp.detail-kelompok');

    const [
        activeTab,
        setActiveTab,
    ] = useState('logbook');


    const [
        showLogbookDetail,
        setShowLogbookDetail,
    ] = useState(false);


    const [
        showAction,
        setShowAction,
    ] = useState(false);


    const [
        selectedLogbook,
        setSelectedLogbook,
    ] = useState(null);


    /* =====================================================
       GROUP
    ===================================================== */

    const {
        data: groupData,
        isLoading: isLoadingGroup,
        refetch: refetchGroup,
    } = useGetKpGroupByIdQuery(id);


    /* =====================================================
       LOGBOOK
    ===================================================== */

    const {
        data: logbooksRaw,
        isLoading: isLoadingLogbook,
        refetch: refetchLogbook,
    } = useGetLogbookQuery(id);


    /* =====================================================
       UPDATE
    ===================================================== */

    const [
        updateLogbook,
        {
            isLoading: isUpdating,
        },
    ] = useUpdateLogbookMutation();


    /* =====================================================
       EFFECT
    ===================================================== */

    useEffect(() => {

        refetchGroup();

    }, [
        id,
        refetchGroup,
    ]);


    /* =====================================================
       DATA
    ===================================================== */

    const data = groupData;

    // Check if student is member of this group
    const isStudentInGroup = useMemo(() => {
        if (!user?.student) return false;
        return data?.members?.some(
            m => m.student_id === user.student.id && m.member_status === 'active'
        ) || false;
    }, [user, data]);

    // Allow access if: has admin/dosen permission OR student is member of this group
    const canAccess = hasDetailPermission || isStudentInGroup;

    useEffect(() => {
        if (!canAccess) {
            navigate('/kp/daftar-kelompok');
        }
    }, [canAccess, navigate]);

    if (!canAccess) {
        return null;
    }

    const logbooks = useMemo(() => {

        if (Array.isArray(logbooksRaw)) {
            return logbooksRaw;
        }

        if (
            Array.isArray(
                logbooksRaw?.data
            )
        ) {
            return logbooksRaw.data;
        }

        return [];

    }, [logbooksRaw]);


    const members =
        data?.members || [];


    const documents =
        data?.kp_documents || [];


    const supervisor =
        members.find(
            member => member.supervisor
        )?.supervisor;


    const isLoading =
        isLoadingGroup ||
        isLoadingLogbook;


    /* =====================================================
       LOGBOOK STATS
    ===================================================== */

    const logbookStats = useMemo(() => {

        const total =
            logbooks.length;

        const approved =
            logbooks.filter(
                item =>
                    item.status === 'approved'
            ).length;

        const pending =
            logbooks.filter(
                item =>
                    item.status === 'pending' ||
                    item.status === 'submitted'
            ).length;

        return {
            total,
            approved,
            pending,
        };

    }, [logbooks]);


    /* =====================================================
       LOGBOOK DETAIL
    ===================================================== */

    const openLogbookDetail = (
        logbook
    ) => {

        setSelectedLogbook(
            logbook
        );

        setShowLogbookDetail(
            true
        );

    };


    /* =====================================================
       APPROVE
    ===================================================== */

    const openAction = (
        logbook
    ) => {

        setSelectedLogbook(
            logbook
        );

        setShowAction(
            true
        );

    };


    const confirmAction = async (
        message
    ) => {

        if (!selectedLogbook) {
            return;
        }

        try {

            const payload = {
                id: selectedLogbook.id,
                status: 'approved',
            };


            await updateLogbook(
                payload
            ).unwrap();


            handleApiSuccess(
                'Logbook berhasil disetujui'
            );


            setShowAction(false);
            setSelectedLogbook(null);


            refetchLogbook();
            refetchGroup();

        } catch (err) {

            handleApiError(
                err,
                'Gagal memproses logbook'
            );

        }

    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (isLoading) {

        return (

            <div className="space-y-6">

                <PageHeader
                    title="Detail Kelompok KP"
                    description="Memuat informasi kelompok..."
                    icon={Users}
                />


                <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-4
                    gap-4
                ">

                    {[1, 2, 3, 4].map(
                        i => (

                            <Skeleton
                                key={i}
                                className="
                                    h-28
                                    rounded-lg
                                "
                            />

                        )
                    )}

                </div>


                <div className="
                    grid
                    grid-cols-1
                    lg:grid-cols-3
                    gap-6
                ">

                    <Skeleton className="
                        h-[500px]
                        rounded-lg
                    " />

                    <Skeleton className="
                        h-[500px]
                        rounded-lg
                        lg:col-span-2
                    " />

                </div>

            </div>

        );

    }


    /* =====================================================
       NOT FOUND
    ===================================================== */

    if (!data) {

        return (

            <div className="space-y-6">

                <PageHeader
                    title="Detail Kelompok KP"
                    description="Data kelompok tidak ditemukan"
                    icon={Users}
                />


                <Card>

                    <EmptyContent
                        icon={Users}
                        title="Kelompok tidak ditemukan"
                        description="
                            Data kelompok yang Anda cari
                            tidak tersedia atau sudah tidak
                            dapat diakses.
                        "
                    />


                    <div className="
                        flex
                        justify-center
                        pb-8
                    ">

                        <Button
                            variant="secondary"
                            onClick={() =>
                                navigate(-1)
                            }
                        >

                            <ArrowLeft className="
                                w-4
                                h-4
                                mr-2
                            " />

                            Kembali

                        </Button>

                    </div>

                </Card>

            </div>

        );

    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="space-y-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <PageHeader
                title={`Detail Kelompok ${data.id}`}
                description="
                    Detail informasi dan aktivitas
                    kelompok Kerja Praktek
                "
                icon={Users}
                actions={

                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(-1)
                        }
                    >

                        <ArrowLeft className="
                            w-4
                            h-4
                            mr-2
                        " />

                        Kembali

                    </Button>

                }
            />


            {/* =================================================
                HERO
            ================================================= */}

            <Card className="
                overflow-hidden
            ">

                <div className="
                    relative
                    bg-linear-to-r
                    from-emerald-600
                    to-emerald-500
                    px-6
                    py-7
                    text-white
                ">

                    <div className="
                        absolute
                        right-0
                        top-0
                        w-64
                        h-64
                        rounded-full
                        bg-white/5
                        -translate-y-1/2
                        translate-x-1/4
                    " />

                    <div className="
                        absolute
                        right-20
                        bottom-0
                        w-32
                        h-32
                        rounded-full
                        bg-white/5
                        translate-y-1/2
                    " />


                    <div className="
                        relative
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-5
                    ">

                        <div className="
                            flex
                            items-center
                            gap-4
                        ">

                            <div className="
                                flex
                                items-center
                                justify-center
                                w-16
                                h-16
                                rounded-2xl
                                bg-white/15
                                border
                                border-white/20
                            ">

                                <UsersRound className="
                                    w-8
                                    h-8
                                    text-white
                                " />

                            </div>


                            <div>

                                <p className="
                                    text-sm
                                    text-emerald-100
                                ">
                                    Kelompok Kerja Praktek
                                </p>

                                <h2 className="
                                    mt-1
                                    text-2xl
                                    font-bold
                                ">
                                    Kelompok {data.id}
                                </h2>

                                <p className="
                                    mt-1
                                    text-sm
                                    text-emerald-100
                                    font-mono
                                ">
                                    KP-{data.id}
                                </p>

                            </div>

                        </div>


                        <div className="
                            bg-white
                            px-4
                            py-2
                            rounded-lg
                            self-start
                            md:self-auto
                        ">
                            {getStatusBadge(
                                data.status
                            )}
                        </div>

                    </div>

                </div>

            </Card>


            {/* =================================================
                LOGBOOK STATISTICS
            ================================================= */}

            <div className="
                grid
                grid-cols-1
                sm:grid-cols-3
                gap-4
            ">

                <Statistik
                    title="Total Aktivitas"
                    value={logbookStats.total}
                    icon={BookOpen}
                    iconClassName="text-blue-600"
                    borderClassName="bg-blue-500"
                />

                <Statistik
                    title="Menunggu"
                    value={logbookStats.pending}
                    icon={Clock}
                    iconClassName="text-yellow-600"
                    borderClassName="bg-yellow-500"
                />

                <Statistik
                    title="Disetujui"
                    value={logbookStats.approved}
                    icon={CheckCircle2}
                    iconClassName="text-emerald-600"
                    borderClassName="bg-emerald-500"
                />

            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="
                grid
                grid-cols-1
                lg:grid-cols-3
                gap-6
            ">

                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <div className="space-y-6">

                    {/* INFORMASI KELOMPOK */}
                    <Card>

                        <div className="p-5">

                            <SectionHeader
                                icon={Users}
                                title="Informasi Kelompok"
                                description="
                                    Informasi dasar kelompok
                                "
                            />


                            <div className="space-y-5">

                                {/* MEMBERS */}
                                <div>

                                    <p className="
                                        text-xs
                                        font-medium
                                        text-gray-400
                                        uppercase
                                        tracking-wide
                                        mb-3
                                    ">
                                        Daftar Anggota
                                    </p>


                                    <div className="space-y-2">

                                        {members.map(
                                            (member, index) => (

                                                <div
                                                    key={member.id}
                                                    className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                        p-2.5
                                                        bg-gray-50
                                                        rounded-lg
                                                        border
                                                        border-gray-100
                                                    "
                                                >

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                        min-w-0
                                                    ">

                                                        <div className="
                                                            flex
                                                            items-center
                                                            justify-center
                                                            w-7
                                                            h-7
                                                            rounded-full
                                                            bg-emerald-50
                                                            text-emerald-600
                                                            shrink-0
                                                        ">

                                                            <span className="
                                                                text-xs
                                                                font-semibold
                                                            ">
                                                                {index + 1}
                                                            </span>

                                                        </div>


                                                        <div className="min-w-0">

                                                            <p className="
                                                                text-sm
                                                                font-medium
                                                                text-gray-900
                                                                truncate
                                                            ">
                                                                {member.student?.name || '-'}
                                                            </p>

                                                            <p className="
                                                                text-xs
                                                                text-gray-500
                                                                font-mono
                                                            ">
                                                                {member.student?.nim || '-'}
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <Badge
                                                        status={
                                                            member.role === 'ketua'
                                                                ? 'ketua'
                                                                : 'anggota'
                                                        }
                                                    >
                                                        {member.role === 'ketua'
                                                            ? 'Ketua'
                                                            : 'Anggota'
                                                        }
                                                    </Badge>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>


                                <DetailItem
                                    icon={CalendarDays}
                                    label="Periode Akademik"
                                    value={
                                        data.academic_period?.name
                                    }
                                />


                                <DetailItem
                                    icon={Clock3}
                                    label="Tanggal Daftar"
                                    value={
                                        formatDate(
                                            data.created_at
                                        )
                                    }
                                />


                                {/* SUPERVISOR */}
                                <div className="
                                    pt-5
                                    border-t
                                    border-gray-100
                                ">

                                    <div className="
                                        flex
                                        gap-3
                                    ">

                                        <div className="
                                            flex
                                            items-center
                                            justify-center
                                            w-9
                                            h-9
                                            rounded-lg
                                            bg-emerald-50
                                            text-emerald-600
                                            shrink-0
                                        ">
                                            <GraduationCap className="w-4 h-4" />
                                        </div>


                                        <div className="min-w-0">

                                            <p className="
                                                text-xs
                                                font-medium
                                                text-gray-400
                                                uppercase
                                                tracking-wide
                                            ">
                                                Dosen Pembimbing
                                            </p>


                                            {supervisor ? (

                                                <div className="
                                                    mt-2
                                                    flex
                                                    items-center
                                                    gap-3
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        justify-center
                                                        w-9
                                                        h-9
                                                        rounded-full
                                                        bg-emerald-50
                                                        text-emerald-600
                                                    ">
                                                        <GraduationCap className="w-4 h-4" />
                                                    </div>


                                                    <div>

                                                        <p className="
                                                            text-sm
                                                            font-semibold
                                                            text-gray-900
                                                        ">
                                                            {supervisor.name}
                                                        </p>

                                                        <p className="
                                                            text-xs
                                                            text-gray-400
                                                            mt-0.5
                                                        ">
                                                            Dosen Pembimbing
                                                        </p>

                                                    </div>

                                                </div>

                                            ) : (

                                                <p className="
                                                    mt-1
                                                    text-sm
                                                    text-gray-400
                                                ">
                                                    Belum ada dosen pembimbing
                                                </p>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </Card>


                    {/* DETAIL KP */}
                    <Card>

                        <div className="p-5">

                            <SectionHeader
                                icon={BriefcaseBusiness}
                                title="Detail Kerja Praktek"
                                description="
                                    Informasi tempat dan tema KP
                                "
                            />


                            <div className="space-y-5">

                                <DetailItem
                                    icon={Building2}
                                    label="Perusahaan"
                                    value={
                                        data.kp_company?.name
                                    }
                                />


                                {data.kp_company?.address && (

                                    <DetailItem
                                        icon={MapPin}
                                        label="Alamat"
                                        value={
                                            data.kp_company.address
                                        }
                                    />

                                )}


                                <DetailItem
                                    icon={BookOpen}
                                    label="Tema KP"
                                    value={
                                        data.kp_theme?.title
                                    }
                                />

                            </div>

                        </div>

                    </Card>


                    {/* DOKUMEN */}
                    {documents.length > 0 && (

                        <Card>

                            <div className="p-5">

                                <SectionHeader
                                    icon={FileText}
                                    title="Dokumen Kelompok"
                                    description={`${documents.length} dokumen`}
                                />


                                <div className="space-y-3">

                                    {documents.map(
                                        (doc) => (

                                            <div
                                                key={doc.id}
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-3
                                                    p-3
                                                    bg-gray-50
                                                    rounded-lg
                                                    border
                                                    border-gray-200
                                                "
                                            >

                                                <div className="
                                                    flex
                                                    items-center
                                                    gap-3
                                                    min-w-0
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        justify-center
                                                        w-10
                                                        h-10
                                                        rounded-lg
                                                        bg-emerald-50
                                                        text-emerald-600
                                                        shrink-0
                                                    ">
                                                        <FileText className="w-5 h-5" />
                                                    </div>


                                                    <div className="min-w-0">

                                                        <p className="
                                                            text-sm
                                                            font-medium
                                                            text-gray-900
                                                            truncate
                                                        ">
                                                            {doc.document_type?.name ||
                                                                doc.title ||
                                                                'Dokumen'
                                                            }
                                                        </p>

                                                        <p className="
                                                            text-xs
                                                            text-gray-500
                                                        ">
                                                            {formatDate(
                                                                doc.submitted_at ||
                                                                doc.created_at
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    shrink-0
                                                ">

                                                    <Badge
                                                        status={
                                                            doc.status === 'approved'
                                                                ? 'approved'
                                                                : doc.status === 'rejected'
                                                                    ? 'rejected'
                                                                    : 'submitted'
                                                        }
                                                    >
                                                        {
                                                            doc.status === 'approved'
                                                                ? 'Disetujui'
                                                                : doc.status === 'rejected'
                                                                    ? 'Ditolak'
                                                                    : 'Menunggu'
                                                        }
                                                    </Badge>


                                                    {doc.file_url && (

                                                        <a
                                                            href={doc.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="
                                                                text-sm
                                                                text-emerald-600
                                                                hover:text-emerald-800
                                                                font-medium
                                                            "
                                                        >
                                                            Lihat
                                                        </a>

                                                    )}

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        </Card>

                    )}


                    {/* CATATAN PENOLAKAN */}
                    {data.rejection_note && (

                        <Card>

                            <div className="p-5">

                                <SectionHeader
                                    icon={XCircle}
                                    title="Catatan Penolakan"
                                    description="
                                        Alasan penolakan pendaftaran
                                    "
                                />

                                <div className="
                                    bg-red-50
                                    border
                                    border-red-200
                                    rounded-lg
                                    p-4
                                ">

                                    <p className="
                                        text-sm
                                        text-red-700
                                        whitespace-pre-wrap
                                    ">
                                        {data.rejection_note}
                                    </p>

                                </div>

                            </div>

                        </Card>

                    )}


                    {/* REVISION */}
                    {data.document_revision_note && (

                        <Card>

                            <div className="p-5">

                                <SectionHeader
                                    icon={AlertCircle}
                                    title="Catatan Revisi Dokumen"
                                    description="
                                        Dokumen perlu diperbaiki
                                    "
                                />

                                <div className="
                                    bg-orange-50
                                    border
                                    border-orange-200
                                    rounded-lg
                                    p-4
                                ">

                                    <p className="
                                        text-sm
                                        text-orange-700
                                        whitespace-pre-wrap
                                    ">
                                        {data.document_revision_note}
                                    </p>

                                </div>

                            </div>

                        </Card>

                    )}


                    {/* DESCRIPTION */}
                    {data.description && (

                        <Card>

                            <div className="p-5">

                                <SectionHeader
                                    icon={FileText}
                                    title="Deskripsi"
                                    description="
                                        Deskripsi kelompok
                                    "
                                />

                                <div className="
                                    bg-gray-50
                                    rounded-lg
                                    p-4
                                ">

                                    <p className="
                                        text-sm
                                        text-gray-700
                                        whitespace-pre-wrap
                                    ">
                                        {data.description}
                                    </p>

                                </div>

                            </div>

                        </Card>

                    )}

                </div>


                {/* =================================================
                    MAIN
                ================================================= */}

                <div className="
                    lg:col-span-2
                ">

                    <Card className="
                        overflow-hidden
                    ">

                        {/* TABS */}
                        <div className="px-5 pt-5">

                            <div className="
                                flex
                                items-center
                                gap-1
                                border-b
                                border-gray-200
                            ">

                                {/* LOGBOOK TAB */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(
                                            'logbook'
                                        )
                                    }
                                    className={`
                                        relative
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-3
                                        text-sm
                                        font-medium
                                        transition-colors
                                        ${
                                            activeTab === 'logbook'
                                                ? 'text-emerald-700'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }
                                    `}
                                >

                                    <BookOpen className="w-4 h-4" />

                                    Logbook

                                    <span className="
                                        px-1.5
                                        py-0.5
                                        rounded-full
                                        text-[10px]
                                        bg-gray-100
                                        text-gray-500
                                    ">
                                        {logbooks.length}
                                    </span>


                                    {activeTab === 'logbook' && (

                                        <span className="
                                            absolute
                                            bottom-0
                                            left-0
                                            right-0
                                            h-0.5
                                            bg-emerald-600
                                            rounded-full
                                        " />

                                    )}

                                </button>


                                {/* LAPORAN TAB */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(
                                            'laporan'
                                        )
                                    }
                                    className={`
                                        relative
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-3
                                        text-sm
                                        font-medium
                                        transition-colors
                                        ${
                                            activeTab === 'laporan'
                                                ? 'text-emerald-700'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }
                                    `}
                                >

                                    <ClipboardList className="w-4 h-4" />

                                    Laporan


                                    {activeTab === 'laporan' && (

                                        <span className="
                                            absolute
                                            bottom-0
                                            left-0
                                            right-0
                                            h-0.5
                                            bg-emerald-600
                                            rounded-full
                                        " />

                                    )}

                                </button>

                            </div>

                        </div>


                        {/* TAB CONTENT */}
                        <div className="p-5">

                            {/* =================================================
                                LOGBOOK
                            ================================================= */}

                            {activeTab === 'logbook' && (

                                <div>

                                    <div className="
                                        flex
                                        flex-col
                                        sm:flex-row
                                        sm:items-center
                                        sm:justify-between
                                        gap-4
                                        mb-6
                                    ">

                                        <div>

                                            <h3 className="
                                                text-sm
                                                font-semibold
                                                text-gray-900
                                            ">
                                                Aktivitas Logbook
                                            </h3>

                                            <p className="
                                                text-xs
                                                text-gray-500
                                                mt-1
                                            ">
                                                Riwayat aktivitas mahasiswa
                                                selama Kerja Praktek
                                            </p>

                                        </div>


                                        <div className="
                                            flex
                                            items-center
                                            gap-2
                                        ">

                                            <div className="
                                                flex
                                                items-center
                                                gap-1.5
                                                rounded-full
                                                bg-emerald-50
                                                px-3
                                                py-1.5
                                                text-xs
                                                font-medium
                                                text-emerald-700
                                            ">

                                                <CheckCircle2 className="w-3.5 h-3.5" />

                                                {logbookStats.approved}
                                                {' '}Disetujui

                                            </div>


                                            {logbookStats.pending > 0 && (

                                                <div className="
                                                    flex
                                                    items-center
                                                    gap-1.5
                                                    rounded-full
                                                    bg-yellow-50
                                                    px-3
                                                    py-1.5
                                                    text-xs
                                                    font-medium
                                                    text-yellow-700
                                                ">

                                                    <Clock className="w-3.5 h-3.5" />

                                                    {logbookStats.pending}
                                                    {' '}Menunggu

                                                </div>

                                            )}

                                        </div>

                                    </div>


                                    {isLoadingLogbook ? (

                                        <div className="
                                            space-y-4
                                        ">

                                            {[1, 2, 3].map(
                                                item => (

                                                    <Skeleton
                                                        key={item}
                                                        className="
                                                            h-40
                                                            rounded-xl
                                                        "
                                                    />

                                                )
                                            )}

                                        </div>

                                    ) : logbooks.length === 0 ? (

                                        <EmptyContent
                                            icon={BookOpen}
                                            title="Belum ada logbook"
                                            description="
                                                Belum terdapat aktivitas
                                                logbook yang dicatat oleh
                                                anggota kelompok.
                                            "
                                        />

                                    ) : (

                                        <LogbookTimeline
                                            logbooks={logbooks}
                                            onDetail={
                                                openLogbookDetail
                                            }
                                        />

                                    )}

                                </div>

                            )}


                            {/* =================================================
                                LAPORAN
                            ================================================= */}

                            {activeTab === 'laporan' && (

                                <EmptyContent
                                    icon={ClipboardList}
                                    title="Laporan belum tersedia"
                                    description="
                                        Fitur pengelolaan dan pemeriksaan
                                        laporan kelompok akan tersedia
                                        pada tahap berikutnya.
                                    "
                                />

                            )}

                        </div>

                    </Card>

                </div>

            </div>


            {/* =================================================
                DETAIL MODAL
            ================================================= */}

            {showLogbookDetail && (

                <LogbookDetailModal
                    isOpen={
                        showLogbookDetail
                    }
                    onClose={() => {

                        setShowLogbookDetail(
                            false
                        );

                        setSelectedLogbook(
                            null
                        );

                    }}
                    logbook={
                        selectedLogbook
                    }
                    onApprove={
                        openAction
                    }
                />

            )}


            {/* =================================================
                APPROVE MODAL
            ================================================= */}

            {showAction && (

                <ActionModal
                    isOpen={showAction}
                    onClose={() => {

                        setShowAction(
                            false
                        );

                        setSelectedLogbook(
                            null
                        );

                    }}
                    onConfirm={
                        confirmAction
                    }
                    submitting={
                        isUpdating
                    }
                />

            )}

        </div>

    );

};

export default DetailKelompok;