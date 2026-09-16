import React from 'react';
import { Driver } from '@/types/types';
import DriverRow from './DriverRow';

interface DriverTableProps {
    drivers: Driver[];
}

const DriverTable: React.FC<DriverTableProps> = ({ drivers }) => {
    return (
        <div className="bg-white rounded-xl shadow overflow-x-auto border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Username
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.map((driver) => (
                        <DriverRow key={driver.id} driver={driver} />
                    ))}
                    {drivers.length === 0 && (
                        <tr>
                            <td colSpan={2} className="px-6 py-10 text-center text-gray-500">
                                No drivers currently available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DriverTable;