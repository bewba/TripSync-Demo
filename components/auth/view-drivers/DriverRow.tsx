import React from 'react';
import { Driver } from '@/types/types';

interface DriverRowProps {
    driver: Driver;
}

const DriverRow: React.FC<DriverRowProps> = ({ driver }) => {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 font-medium text-gray-900">
                {driver.username}
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${driver.status === 'Active Trip' ? 'bg-emerald-100 text-emerald-800' :
                    driver.status === 'Assigned Trip' ? 'bg-blue-100 text-blue-800' :
                        driver.status === 'Pending Trip Assignment' ? 'bg-gray-100 text-gray-800' :
                            'bg-amber-100 text-amber-800'
                    }`}>
                    {driver.status}
                </span>
            </td>
        </tr>
    );
};

export default DriverRow;