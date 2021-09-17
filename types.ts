export interface Store {
    storeId: string
    storeName: string
    totalPrice: number
    splitMonthsWhenProgram: number
    programJoinFee: number
    discountWhenNew: number
    discountWhenMNP: number
    discountWhenChange: number
    twoStepsLoan: boolean
    returnableAfter: number
    oneStep: number
    restWhenOneStepPrice: number
    restWhenOneStepRate: number
    ifReturnBeforeByMonth: number
    ifReturnBeforeTotal: number
}
export interface Price {
    name: string
    first: number
    monthly1: number
    monthly2Str?: string
    monthly2?: number
    last: number
    total: number
    requiredReturn: boolean
    message?: string
}