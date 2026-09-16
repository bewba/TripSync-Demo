import { useState } from "react";
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/Toast/Toast";
import { TripTextArea, FormSection, QuantityField } from "@/components/form-builder";
import { StepButton } from "@/components/auth/plan-trip/StepButton";
import { TripFormData, InventoryItem } from "@/types/auth/plan-trip/trip-info";

interface RequestInformationFormProps {
    data: Partial<TripFormData>;
    onNext: (data: Partial<TripFormData>) => void;
    onBack: () => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const UNIT_OPTIONS = [
    { label: 'PCS', value: 'pcs' },
    { label: 'TONS', value: 'tons' },
    { label: 'KGS', value: 'kgs' },
];

const InventoryStep = ({ data = {}, onNext, onBack, showToast }: RequestInformationFormProps) => {
    // Safely initialize state by checking if inventoryItems exists in data
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(
        data?.inventoryItems?.length
            ? data.inventoryItems
            : [{ itemName: "", itemQuantity: 1, itemUnit: "kgs" }]
    );

    // Removed local showToast

    const handleUpdateItem = (
        index: number,
        field: keyof InventoryItem,
        value: string | number
    ) => {
        const updatedItems = [...inventoryItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setInventoryItems(updatedItems);
    };

    const addNewRow = () => {
        const lastItem = inventoryItems[inventoryItems.length - 1];

        // Validation: Don't add a new row if the current one is empty
        if (!lastItem.itemName.trim()) {
            showToast("Please enter an item name first", "error");
            return;
        }

        setInventoryItems([...inventoryItems, { itemName: "", itemQuantity: 1, itemUnit: "kgs" }]);
    };

    const removeRow = (index: number) => {
        // If it's the only row, just clear it instead of removing it
        if (inventoryItems.length === 1) {
            setInventoryItems([{ itemName: "", itemQuantity: 1, itemUnit: "kgs" }]);
            return;
        }
        setInventoryItems(inventoryItems.filter((_, i) => i !== index));
    };

    const handleContinue = () => {
        // Allow empty trucks: Filter out any completely empty rows before saving
        const validItems = inventoryItems.filter(item => item.itemName.trim() !== "");

        // Pass the updated data back to the parent
        onNext({ ...data, inventoryItems: validItems });
    };

    return (
        <FormSection title="Inventory Request">
            <div className="space-y-4">
                {inventoryItems.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 p-4 sm:p-0 border border-slate-100 sm:border-0 rounded-xl sm:rounded-none bg-slate-50/30 sm:bg-transparent relative mb-2 sm:mb-0">
                        {/* Item Description */}
                        <div className="flex-1">
                            <TripTextArea
                                label={index === 0 ? "Item Name" : ""}
                                name={`itemName-${index}`}
                                placeholder="Item name (optional)..."
                                value={item.itemName}
                                onChange={(e) => handleUpdateItem(index, "itemName", e.target.value)}
                                rows={1}
                            />
                        </div>

                        {/* Quantity with dropdown */}
                        <div className="w-full sm:w-56 shrink-0">
                            <QuantityField
                                label={index === 0 ? "Qty" : ""}
                                name={`qty-${index}`}
                                value={item.itemQuantity}
                                onChange={(e) => handleUpdateItem(index, "itemQuantity", e.target.value)}
                                unitName={`unit-${index}`}
                                unitValue={item.itemUnit}
                                onUnitChange={(e) => handleUpdateItem(index, "itemUnit", e.target.value)}
                                unitOptions={UNIT_OPTIONS}
                                placeholder="0"
                            />
                        </div>

                        {/* Remove Action */}
                        <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className={`${index === 0 ? 'sm:mt-8' : 'sm:mt-2'} p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0 self-end sm:self-auto mt-2`}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Row Button */}
            <div className="flex justify-center mt-6">
                <button
                    type="button"
                    onClick={addNewRow}
                    className="p-3 border-2 border-dashed border-gray-300 rounded-full text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all"
                >
                    <Plus size={24} />
                </button>
            </div>

            <StepButton
                onClick={handleContinue}
                onBack={onBack}
                label="Continue to Step 4"
            />
        </FormSection>
    );
};

export default InventoryStep;