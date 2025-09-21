
export const PAGE_FILTER = {
    ALL: 'all',
    MY_PAGES: 'my_pages',
    EXPLORE_PAGES: 'explore_pages',
    FOLLOWED_PAGES: 'followed_pages',
    RECENT_ACTIVITY: 'recent_activity',
    JOINED_PAGES: 'joined_pages',
    RECENTLY: 'recently',
    NEWEST: 'newst',
    ABOUT: 'about',
    OLDEST: 'oldest',
    A_Z: 'a_z',
    Z_A: 'z_a',
};

export const STATUS = {
    ACCEPT: 'accept',
    REQUEST: 'request',
    FOLLOW_BACK: 'follow back',
    REJECT: 'reject',
    PENDING: 'pending',
    CANCEL: 'cancel',
    SUCCESS: 'succeeded',
    FAILED: 'failed',
};

export const ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    PATIENT: 'patient',
};

export const FORMATTERS = {
    IMAGE: 'img',
    DATE: 'date',
    TIME: 'time',
    EXPERIENCE: 'experience_year',
    PERCENTAGE: 'percentage',
};

export const SETTINGS = {
    GENERAL: 'general',
    SECURITY: 'security',
    VISIBILITY: 'visibility',
    NOTIFICATION: 'notification',
};

export const ID_PROOF_DOCUMENT = {
    PASSPORT: 'passport',
    DEIVEING_LICENSE: 'drivers_license',
    NATIONAL_ID: 'national_id',
    VOTER_ID: 'voter_id',
    PAN_CARD: 'pan_card',
    ADDHAR_CARD: 'aadhaar_card',
    SSB_CARD: 'ssn_card',
    RESIDENT_PERMIT: 'resident_permit',
    MILITARY_CARD: 'military_id',
    WORK_PERMIT: 'work_permit',
    // Specialized documents for brain specialists (psychologists/psychiatrists)
    MEDICAL_LICENSE: 'medical_license',
    PSYCHOLOGY_LICENSE: 'psychology_license',
    PSYCHIATRY_CERTIFICATE: 'psychiatry_certificate',
    CLINICAL_PSYCHOLOGY_DIPLOMA: 'clinical_psychology_diploma',
    NEUROPSYCHOLOGY_CERTIFICATE: 'neuropsychology_certificate',
    COUNSELING_CERTIFICATE: 'counseling_certificate',
    MENTAL_HEALTH_SPECIALIST_LICENSE: 'mental_health_specialist_license',
    BOARD_CERTIFICATION: 'board_certification',
    PROFESSIONAL_REGISTRATION: 'professional_registration',
    CONTINUING_EDUCATION_CERTIFICATE: 'continuing_education_certificate',
};

export const VERFICATION_STATUS = {
    REQUESTED: 'requested',
    VERIFED: 'verified',
    REJECTED: 'rejected',
    UNVERIFIED: 'unverified',
};
