const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const res = await fetch(url.toString())

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`)
  }

  const json = await res.json()
  return json as T
}

export interface CheckMaterialRequest {
  menu_id: number
  quantity: number
}

export interface CheckMaterialResponse {
  success: boolean
  message: string
  data: null
}

export async function checkAvailableMaterial(
  payload: CheckMaterialRequest,
): Promise<CheckMaterialResponse> {
  const url = new URL(`${BASE_URL}/check-available-materials`)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`)
  }

  const json = await res.json()
  return json as CheckMaterialResponse
}

export interface CheckMaterialBulkRequest {
  items: CheckMaterialRequest[]
}

export interface CheckMaterialBulkResponse {
  success: boolean
  message: string
  data: null
}

export async function checkAvailableMaterialBulk(
  payload: CheckMaterialBulkRequest,
): Promise<CheckMaterialBulkResponse> {
  const url = new URL(`${BASE_URL}/check-available-materials/bulk`)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`)
  }

  const json = await res.json()
  return json as CheckMaterialBulkResponse
}
