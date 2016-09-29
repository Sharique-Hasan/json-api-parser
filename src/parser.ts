
export class JsonApiParser {
    private static _pool: Object;

    constructor(){ }

    static configure(pool: Object){
        JsonApiParser._pool = pool;
    }

    get pool(): Object{
        return JsonApiParser._pool;
    }
}