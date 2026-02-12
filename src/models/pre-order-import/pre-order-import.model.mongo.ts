import mongoose, { Schema } from 'mongoose';
import { PreOrderImport } from '../../types/pre-order-import/pre-order-import';
import {
    PreOrderImportStatus,
    PreOrderImportType,
} from '../../config/enums/pre-order-import.enum';

export interface IPreOrderImportDocument
    extends mongoose.Document, PreOrderImport {}

const PreOrderImportSchema = new Schema<IPreOrderImportDocument>(
    {
        sku: {
            type: String,
            required: [true, 'SKU is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        type: {
            type: String,
            enum: [PreOrderImportType.NORMAL, PreOrderImportType.PRE_ORDER],
            required: [true, 'Type is required'],
        },
        targetDate: {
            type: Date,
            required: [true, 'Target date is required'],
        },

        targetQuantity: {
            type: Number,
            required: [true, 'Target quantity is required'],
            min: [1, 'Target quantity must be at least 1'],
        },
        managerResponsibility: {
            type: String,
            required: [true, 'Manager responsibility is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: [
                PreOrderImportStatus.PENDING,
                PreOrderImportStatus.DONE,
                PreOrderImportStatus.CANCELLED,
            ],
            default: PreOrderImportStatus.PENDING,
            required: [true, 'Status is required'],
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const PreOrderImportModel = mongoose.model<IPreOrderImportDocument>(
    'PreOrderImport',
    PreOrderImportSchema
);
