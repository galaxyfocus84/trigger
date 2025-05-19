interface IVec {
    x: number;
    y: number;
    z: number;
}

function createVec(vec?: IVec): IVec {
    if (vec !== undefined) {
        return Vec(vec.x, vec.y, vec.z);
    }
    return Vec(0, 0, 0);
}

function createVecFromCoords(x: number, y: number, z: number): IVec {
    return Vec(x || 0, y || 0, z || 0);
}

interface IBound {
    min: IVec;
    max: IVec;
}

class Zone {
    private p1 = createVec();
    private p2 = createVec();

    private bound: IBound = {
        min: createVec(),
        max: createVec(),
    };

    private origin = createVec();

    constructor(p1?: IVec, p2?: IVec) {
        if (p1 != undefined) {
            this.p1 = p1;
        }
        if (p2 != undefined) {
            this.p2 = p2;
        }
        if (p1 != undefined || p2 != undefined) {
            this.computeInit();
        }
    }

    private computeInit(): void {
        this.computeBoundingBox();
        this.computeOrigin();
    }

    private computeBoundingBox() {
        const minX = Math.min(this.p1.x, this.p2.x);
        const maxX = Math.max(this.p1.x, this.p2.x);
        const minZ = Math.min(this.p1.z, this.p2.z);
        const maxZ = Math.max(this.p1.z, this.p2.z);
        const minY = Math.min(this.p1.y, this.p2.y);
        const maxY = Math.max(this.p1.y, this.p2.y);
        this.bound.min = createVecFromCoords(minX, minY, minZ);
        this.bound.max = createVecFromCoords(maxX, maxY, maxZ);
    }

    private computeOrigin() {
        const x = Math.floor((this.bound.min.x + this.bound.max.x) / 2);
        const y = Math.floor((this.bound.min.y + this.bound.max.y) / 2);
        const z = Math.floor((this.bound.min.z + this.bound.max.z) / 2);
        this.origin = createVecFromCoords(x, y, z);
    }

    public getP1(): IVec {
        return createVec(this.p1);
    }

    public getP2(): IVec {
        return createVec(this.p1);
    }

    public setP1(p1: IVec) {
        this.p1 = p1;
        this.computeInit();
    }

    public setP2(p2: IVec) {
        this.p2 = p2;
        this.computeInit();
    }

    public getOrigin(): IVec {
        return createVec(this.origin);
    }

    public includeVec(vec: IVec): boolean {
        return (
            vec.x >= this.bound.min.x &&
            vec.x <= this.bound.max.x &&
            vec.y >= this.bound.min.y &&
            vec.y <= this.bound.max.y &&
            vec.z >= this.bound.min.z &&
            vec.z <= this.bound.max.z
        );
    }

    public getBound(): IBound {
        return this.bound;
    }
}

/**
 * Проверяет, пересекаются ли две зоны, и (опционально) возвращает зону пересечения.
 *
 * @param {Zone} zone1 - Первая зона для проверки пересечения.
 * @param {Zone} zone2 - Вторая зона для проверки пересечения.
 * @param {boolean} includeIntersectionZone - Если `true`, возвращает зону пересечения, иначе null.
 * @returns {[boolean, Zone | null]} Вернет кортеж, где:
 *   - Первый элемент (`boolean`) указывает, пересекаются ли зоны.
 *   - Второй элемент (`Zone | null`) содержит зону пересечения (если `includeIntersectionZone = true`), иначе `null`.
 *
 * @example
 * // Проверка пересечения без получения зоны
 * const [isIntersecting] = isZonesIntersecting(zone1, zone2, false);
 * if (isIntersecting) {
 *   console.log("Зоны пересекаются!");
 * }
 *
 * @example
 * // Получение зоны пересечения
 * const [isIntersecting, intersectionZone] = isZonesIntersecting(zone1, zone2, true);
 * if (isIntersecting) {
 *   console.log("Зона пересечения:", intersectionZone);
 * }
 */
function isZonesIntersecting(zone1: Zone, zone2: Zone, includeIntersectionZone: boolean): [boolean, Zone | null] {
    const z1 = zone1.getBound();
    const z2 = zone2.getBound();

    // Проверяем пересечение.
    const isIntersecting =
        z1.min.x <= z2.max.x &&
        z1.max.x >= z2.min.x &&
        z1.min.y <= z2.max.y &&
        z1.max.y >= z2.min.y &&
        z1.min.z <= z2.max.z &&
        z1.max.z >= z2.min.z;

    // Если зоны не пересекаются
    if (!isIntersecting) {
        return [false, null];
    }
    // Если зоны пересекаются, но получение зоны пересечения не требуется.
    if (!includeIntersectionZone) {
        return [true, null];
    }

    // Находим зону пересечения.
    const min = createVec({
        x: Math.max(z1.max.x, z2.max.x),
        y: Math.max(z1.min.y, z2.min.y),
        z: Math.max(z1.min.z, z2.min.z),
    });
    const max = createVec({
        x: Math.min(z1.max.x, z2.max.x),
        y: Math.min(z1.max.y, z2.max.y),
        z: Math.min(z1.max.z, z2.max.z),
    });

    return [true, new Zone(min, max)];
}

/**
 * Проверяет, находится ли точка внутри зоны (включая границы).
 * @param {Zone} zone зона.
 * @param {IVec} vec Точка {x, y, z}.
 * @returns {boolean} вернет true, если vec внутри зоны.
 */
function isVecInZone(zone: Zone, vec: IVec): boolean {
    const bound: IBound = zone.getBound();
    return (
        vec.x >= bound.min.x &&
        vec.x <= bound.max.x &&
        vec.y >= bound.min.y &&
        vec.y <= bound.max.y &&
        vec.z >= bound.min.z &&
        vec.z <= bound.max.z
    );
}

/**
 * Создает копию зоны.
 * @param {Zone} zone Исходная зона.
 * @returns {Zone} Вернет новую зону.
 */
function cloneZone(zone: Zone): Zone {
    const p1 = zone.getP1();
    const p2 = zone.getP2();
    return new Zone(p1, p2);
}
