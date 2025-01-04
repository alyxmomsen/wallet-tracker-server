
export interface IRequirementStatsType {
    createdTimeStamp: number
    updatedTimeStamp: number
    dateToExecute: number
    description: string
    transactionTypeCode: number
    id: string
    userId: string
    title: string
    value: number
    deleted: boolean
    executed: null | {
        executedTimeStamp: number
    }
}

export type TAuthUserData = {
    userId: string
}

export type TUserData = {
    name: string
    wallet: number
    createdTimeStamp: number
    updatedTimeStamp: number
    id: string
}

export type TDBUserData = {
    username: string
}

// p - payload
export type IOrdinaryResponse<P> = {
    status: {
        code: number
        details: string
    }
    payload: P | null
}

//
export type TRequestBodyType = {
    userName: string
    password: string
}

export type TUserStatsOmitPasswordOrdinaryResponse = IOrdinaryResponse<
    Omit<IUserStats, 'password'>
>

export type TCheckUserAuthResponseData = {
    token: string
}

export interface INewUserStats extends Omit<IUserStats, 'password' | 'id'> {
    token: string
}

interface IGetPersonStatsResponse {
    userData: Omit<IUserStats, 'password'> | null
    details: {
        code: number
        description: string
    }
}

export type TWalletTrackValue = {
    valueAfter: number
    valueBefore: number
    value: number
    executionDate: number
    transactionTypeCode: number
}

export interface IUserStats {
    name: string
    wallet: number
    id: string
    requirements: Omit<IRequirementStatsType, 'userId'>[]
    createdTimeStamp: number
    updatedTimeStamp: number
    password: string
}

export type TUserStats__1 = Omit<
    IUserStats,
    'wallet' | 'requirements' | 'password'
>

export type TDataBaseUser = {
    createdUnixDate: number
    password: string
    username: string
    userId: string
}

export type TRequrementsDataBaseType = {
    dateToExecute: number
    description: string
    title: string
    userId: string
    value: number
    cashFlowDirectionCode: number
}

export type TWalletData = {
    walletId: string
    balance: number
    title: string
    description: string
}

export type TWalletDBData = {
    userId: string
    balance: number
    title: string
    description: string
}

export type TDatabaseResultStatus<T> = {
    status: boolean
    message: string
    userData: T | null
}

export type TAuthServiceCheckTokenResponse = {
    payload: { updatedToken: string } | null
    status: {
        code: number
        description: string
    }
}
