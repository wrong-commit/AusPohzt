import { client } from '../client';
export { mockClientFactory }
/**
 * Create a mock of client automatically
 */
const mockClientFactory = (
    mockMethods: {
        _createParcel?: jest.Mock<any, any>
        _sync?: jest.Mock<any, any>
        _parsesTrackingEvent?: jest.Mock<any, any>
    }): client<any> => {

    const cl = {
        createPacel: mockMethods._createParcel ?? jest.fn(),
        sync: mockMethods._sync ?? jest.fn(),
        parseTrackingEvent: mockMethods._parsesTrackingEvent ?? jest.fn(),
    };

    return {
        ...cl,
    }
}
