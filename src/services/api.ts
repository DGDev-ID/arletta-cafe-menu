import type {
  MakeTransactionRequest,
  TransactionResponse,
  TransactionStatusResponse,
  CreateOpenBillRequest,
  CreateOpenBillResponse,
  AddOrderOpenBillRequest,
  AddOrderOpenBillResponse,
} from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export class ApiError extends Error {
  public data?: unknown

  constructor(
    public status: number,
    message: string,
    data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.data = data
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`)
  }

  return res.json()
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`)
  }

  return res.json()
}

export interface MakeTransactionApiResponse {
  success: boolean
  message: string
  data: TransactionResponse
}

export async function makeTransaction(
  payload: MakeTransactionRequest,
): Promise<MakeTransactionApiResponse> {
  const url = new URL(`${BASE_URL}/make-transaction`)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new ApiError(res.status, json?.message ?? `API error: ${res.status}`, json)
  }

  return json
}

export async function getTransactionStatus(
  transactionId: number,
): Promise<TransactionStatusResponse> {
  const url = new URL(`${BASE_URL}/transaction/${transactionId}/status`)
  const res = await fetch(url.toString())

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`)
  }

  return res.json()
}

export async function createOpenBill(
  payload: CreateOpenBillRequest,
): Promise<CreateOpenBillResponse> {
  const url = new URL(`${BASE_URL}/create-open-bill`)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new ApiError(res.status, json?.message ?? `API error: ${res.status}`, json)
  }

  return json
}

export async function addOrderOpenBill(
  payload: AddOrderOpenBillRequest,
): Promise<AddOrderOpenBillResponse> {
  const url = new URL(`${BASE_URL}/add-order-open-bill`)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new ApiError(res.status, json?.message ?? `API error: ${res.status}`, json)
  }

  return json
}
