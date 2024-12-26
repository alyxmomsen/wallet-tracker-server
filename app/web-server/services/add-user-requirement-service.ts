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
            const updatedUser = await app.addUserRequirement({
                ...body,
                authToken: userId,
            })
            // TResponseJSONData<TUserData>

            if (updatedUser === null) {
                return {
                    payload: null,
                    status: {
                        code: 46465,
                        details: 'user is not created',
                    },
                }
            }

            return {
                payload: {
                    createdTimeStamp: updatedUser.getCreatedTimeStamp(),
                    updatedTimeStamp: updatedUser.getCreatedTimeStamp(),
                    id: updatedUser.getId(),
                    name: updatedUser.getUserName(),
                    wallet: updatedUser.getWalletBalance(),
                    requirements: updatedUser
                        .getAllReauirementCommands()
                        .map((requirement) => {
                            return {
                                dateToExecute: requirement.getExecutionDate(),
                                description: requirement.getDescription(),
                                isExecuted: requirement.checkIfExecuted(),
                                title: requirement.getTitle(),
                                userId: requirement.getId(),
                                value: requirement.getValue(),
                                cashFlowDirectionCode:
                                    requirement.getTransactionTypeCode(),
                                id: requirement.getId(),
                                deleted: requirement.getDeleted(),
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
