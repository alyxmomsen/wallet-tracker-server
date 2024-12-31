import {
    ApplicationSingletoneFacade,
    IApplicationFacade,
} from '../../core/src/ApplicationFacade'
import { IRequirementStatsType } from '../../core/src/types/commonTypes'
import { TResponseJSONData, TUserData } from '../express'

export interface IAddUserRequirementService {
    execute(
        app: ApplicationSingletoneFacade,
        body: any,
        userId: string
    ): Promise<TResponseJSONData<TUserData>>
}

export class AddUserRequirementService implements IAddUserRequirementService {
    async execute(
        app: ApplicationSingletoneFacade,
        body: Omit<IRequirementStatsType, 'id' | 'userId' | 'deleted'>,
        userId: string
    ): Promise<
        TResponseJSONData<
            TUserData & {
                requirements: Omit<
                    IRequirementStatsType,
                    'id' | 'executed' | 'deleted'
                >[]
            }
        >
    > {
        try {
            const response = await app.addUserRequirement({
                ...body,
                authToken: userId,
            })
            // TResponseJSONData<TUserData>

            if (response.payload === null) {
                return {
                    payload: null,
                    status: {
                        code: response.status.code,
                        details: response.status.details,
                    },
                }
            }

            const responsedUser = response.payload

            return {
                payload: {
                    createdTimeStamp: responsedUser.getCreatedTimeStamp(),
                    updatedTimeStamp: responsedUser.getCreatedTimeStamp(),
                    id: responsedUser.getId(),
                    name: responsedUser.getUserName(),
                    wallet: responsedUser.getWalletBalance(),
                    requirements: responsedUser
                        .getAllReauirementCommands()
                        .map((requirement) => {
                            return {
                                dateToExecute: requirement.getExecutionDate(),
                                description: requirement.getDescription(),
                                executed: requirement.isExecuted(),
                                title: requirement.getTitle(),
                                userId: requirement.getId(),
                                value: requirement.getValue(),
                                cashFlowDirectionCode:
                                    requirement.getTransactionTypeCode(),
                                id: requirement.getId(),
                                deleted: requirement.getDeleted(),
                                createdTimeStamp:
                                    requirement.getCreatedTimeStamp(),
                                updatedTimeStamp:
                                    requirement.getUpdatedTimeStamp(),
                            }
                        }),
                },
                status: {
                    code: 0,
                    details: 'details',
                },
            }
        } catch (error) {
            console.log({ error })
            return {
                payload: null,
                status: {
                    code: 5,
                    details:
                        typeof error === 'string' ? error : 'Somthing wrong',
                },
            }
        }
    }

    constructor() {}
}
