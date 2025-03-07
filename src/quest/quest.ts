/** Квест. */
interface IQuest<D, M> extends IQuestLifecycle {
    data?: (this: void) => D; // TODO extends object
    methods?: M;
    handlers?: IQuesTriggerHandlers & ThisType<D & M & Required<IQuesTriggerHandlers> & Required<IQuestLifecycle>>;
    /** Обработчики событий Триггера имеют доступ:
     * 1. к данным (D)
     * 2. к методам (M)
     * 3. к другим обработчикам событий Триггера
     * 4. к методам жизненного цикла квеста
     */
}

/** Методы жизненного цикла. */
interface IQuestLifecycle {
    init?(): void;
    start?(): void;
    end?(): void;
}

/** Методы обработки событий Триггера. */
interface IQuesTriggerHandlers {
    enter?(): void;
    leave?(): void;
    move?(): void;
    timer?(): void;
    signal?(): void;
    attack?(): void;
    interact?(): void;
}

type TQuest<D, M> = IQuest<D, M & ThisType<D & M>>; // TODO ?
type TQuestParams<D, M> = IQuest<
    D,
    /** Методы квеста имеют доступ:
     * 1. к данным (D)
     * 2. к другим методам (M)
     * 3. к методам обработки событий Триггера
     * 4. к методам жизненного цикла квеста
     */
    M & ThisType<D & M & Required<IQuesTriggerHandlers> & Required<IQuestLifecycle>>
> &
    /** Контекст (this) для методов */
    ThisType<D & M & Required<IQuesTriggerHandlers> & Required<IQuestLifecycle>>;

export function createQuest<D, M>(quest: TQuestParams<D, M>): TQuest<D, M> {
    const data: object = quest.data?.() || {};
    const methods: object = quest.methods || {};
    const handlers: object = quest.handlers || {};
    return { ...data, ...methods, ...handlers } as TQuest<D, M>;
}
