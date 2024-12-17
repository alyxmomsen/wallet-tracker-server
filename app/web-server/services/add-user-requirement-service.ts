import {
    ApplicationSingletoneFacade,
    IApplicationFacade,
} from '../../core/src/ApplicationFacade'
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
        body: any,
        userId: string
    ): Promise<TResponseJSONData<TUserData>> {
        try {
            const updatedUser = await app.addUserRequirement({
                ...body,
                userId: userId,
            })
            // TResponseJSONData<TUserData>
            return {
                payload: {
                    id: updatedUser.getId(),
                    userName: updatedUser.getUserName(),
                    wallet: updatedUser.getWalletBalance(),
                    requirements: updatedUser
                        .getAllReauirementCommands()
                        .map((require) => {
                            return {
                                date: require.getExecutionDate(),
                                description: require.getDescription(),
                                isExecuted: require.checkIfExecuted(),
                                title: require.getTitle(),
                                transactionTypeCode:
                                    require.getTransactionTypeCode(),
                                value: require.getValue(),
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
