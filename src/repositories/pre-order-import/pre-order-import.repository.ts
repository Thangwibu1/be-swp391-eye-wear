import {
    PreOrderImportModel,
    IPreOrderImportDocument,
} from '../../models/pre-order-import/pre-order-import.model.mongo';
import { BaseRepository } from '../base.repository';
import {
    PreOrderImportStatus,
    PreOrderImportType,
} from '../../config/enums/pre-order-import.enum';

export class PreOrderImportRepository extends BaseRepository<IPreOrderImportDocument> {
    constructor() {
        super(PreOrderImportModel);
    }

    /**
     * Tìm đợt pre-order import đang hoạt động (không bị hủy) cho danh sách SKU
     * @param skus Danh sách các SKU cần kiểm tra
     * @param type Loại import (mặc định là PRE_ORDER)
     * @returns IPreOrderImportDocument | null
     */
    async findActivePreOrderImportBySkus(
        skus: string[],
        type: PreOrderImportType = PreOrderImportType.PRE_ORDER
    ) {
        return await this.model.findOne({
            sku: { $in: skus },
            type: type,
            status: { $ne: PreOrderImportStatus.CANCELLED },
            deletedAt: null,
        });
    }
}

export const preOrderImportRepository = new PreOrderImportRepository();
