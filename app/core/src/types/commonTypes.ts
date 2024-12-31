export interface IRequirementStatsType {
    createdTimeStamp: number
    updatedTimeStamp: number
    dateToExecute: number
    description: string
    cashFlowDirectionCode: number
    id: string
    userId: string
    title: string
    value: number
    deleted: boolean
    executed: null | {
        executedTimeStamp: number
    }
}
