// article endpoint returns shipmentResponse 
export {
    shipmentsResponse,
    DELIVERED_CODE,
    DELIVERY_FAILED,
    AWAITING_COLLECTION,
    PENDING,
    TRANSIT,
}

const DELIVERED_CODE = 'DD-ER13';
const DELIVERY_FAILED = 'DD-ER8';
const AWAITING_COLLECTION = 'DD-ER4';
const PENDING = 'ADMIN-ER39';
const TRANSIT = [
    'AFC-ER31',
    'NSS-ER42',
    'NSS-ER01',
    'AFP-ER13',
    'TTP-ER37,'
]

type shipmentsResponse = {
    status: 'Success' | /*?*/'Failure';
    consignmentId: string; // number ? 
    articles: article[];
}

type article = {
    articleId: string;
    status: status;
    altStatus: string | null;
    trackStatusOfArticle: string;
    statusColour: string;
    redirectIneligibility: codeReason;
    safeDropIneligibility: codeReason;
    details: detail[];
}

type detail = {
    articleId: string;
    consignmentId: string;
    articleType: string;
    productSubType: string;

    internationalTracking: any;
    estimatedDeliveryDateEligible: boolean;
    signatureOnDelivery: signatureOnDelivery;

    events: event[];
}

type event = {
    dateTime: number; // local time
    localeDateTime: string; // cast to Datee
    description: string;
    location: null | string;
    eventCode: string;
    wcid: null | string;
}
type signatureOnDelivery = {
    required: boolean;
    instruction: {
        code: 'SIG_NO',
        description: string | null;
    }
}

type status = {
    statusAttributeName: string;
    statusAttributeValue: 'Delivered';
    statusModificationTime: number;
}

type codeReason = {
    code: string; // number ? 
    reason: string;
}
