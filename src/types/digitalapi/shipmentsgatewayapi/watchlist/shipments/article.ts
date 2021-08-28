// article endpoint returns shipmentResponse 
export { shipmentsResponse }

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
    location: string;
    eventCode: string;
    wcid: string;
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
