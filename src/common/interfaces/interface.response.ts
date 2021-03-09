export interface GetVersionResponse {
    version: string
}

export interface Get3DPhotoInputElementResponse {
    id: string
    url: string
    requested_at: number
}

export interface Get3DPhotoInputResponse {
    results: Array<Get3DPhotoInputElementResponse>
}

export interface Get3DPhotoOutputElementResponse {
    id: string
    url: string
    created_at: number
}

export interface Get3DPhotoOutputResponse {
    results: Array<Get3DPhotoOutputElementResponse>
}

export interface ErrorResponse {
    message: string
}