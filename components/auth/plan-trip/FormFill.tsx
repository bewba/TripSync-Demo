import React, { useState, useEffect } from 'react';
import { Clock, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/Toast/Toast';
import {
  TripFormField,
  TripTextArea,
  FormSection,
  FormGrid,
  FormDivider
} from '@/components/form-builder';
import { StepButton } from '@/components/auth/plan-trip/StepButton';
import type { TripFormData } from '@/types/auth/plan-trip/trip-info'

interface RequestInformationFormProps {
  data: Partial<TripFormData>; // Receive current state
  onNext: (data: Partial<TripFormData>) => void; // Pass data back on success
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const RequestInformationForm = ({ data, onNext, showToast }: RequestInformationFormProps) => { // Added 'data' to destructuring
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    requestDate: data.requestInfo?.requestDate || '',
    requestTime: data.requestInfo?.requestTime || '',
    scheduledDeparture: data.requestInfo?.scheduledDeparture || '',
    travelPurpose: data.requestInfo?.travelPurpose || '',
    requestedBy: data.requestInfo?.requestedBy || '',
    notes: data.requestInfo?.notes || '',
  });

  const [depDate, setDepDate] = useState('');
  const [depHour, setDepHour] = useState('12');
  const [depMin, setDepMin] = useState('00');
  const [depAmPm, setDepAmPm] = useState<'AM' | 'PM'>('AM');
  const [minDate, setMinDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // Helper date formatting utilities using local time
  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatLocalDateTime = (d: Date) => {
    const dateStr = formatLocalDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateStr}T${hours}:${minutes}`;
  };

  // Rounds up to next 5-minute interval (:00, :05, :10, :15, etc. - flat 0 or 5)
  const getNext5MinuteDate = (date: Date = new Date()): Date => {
    const d = new Date(date);
    d.setSeconds(0, 0);
    d.setMilliseconds(0);
    const currentMinutes = date.getMinutes() + date.getSeconds() / 60 + date.getMilliseconds() / 60000;
    const targetMinutes = Math.ceil(currentMinutes / 5) * 5;
    // Always round strictly forward to the next slot (ending in flat 0 or 5)
    const nextMin = targetMinutes <= currentMinutes ? targetMinutes + 5 : targetMinutes;
    d.setMinutes(nextMin);
    return d;
  };

  // 1. Sync session name or default fallback to requestedBy
  useEffect(() => {
    const userName = session?.user?.name || 'Demo Fleet Manager';
    if (!formData.requestedBy) {
      setFormData(prev => ({ ...prev, requestedBy: userName }));
    }
  }, [session, formData.requestedBy]);

  // 2. Automatically set "Now" for request fields if empty
  useEffect(() => {
    const now = new Date();
    const dateStr = formatLocalDate(now);
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setFormData((prev: any) => ({
      ...prev,
      requestDate: prev.requestDate || dateStr,
      requestTime: prev.requestTime || timeStr,
    }));
  }, []);

  const setPickerFromDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return;
    const [date, time] = dateTimeStr.split('T');
    if (!date || !time) return;

    setDepDate(date);

    const [hStr, mStr] = time.split(':');
    let h24 = parseInt(hStr || '0', 10);
    let mNum = parseInt(mStr || '0', 10);

    // Round up to next multiple of 5 if not already on a 5-minute boundary
    if (mNum % 5 !== 0) {
      mNum = Math.ceil(mNum / 5) * 5;
    }
    if (mNum >= 60) {
      mNum = 0;
      h24 = (h24 + 1) % 24;
    }
    const m = String(mNum).padStart(2, '0');

    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;

    const ampm = h24 >= 12 ? 'PM' : 'AM';

    setDepHour(String(h12).padStart(2, '0'));
    setDepMin(m);
    setDepAmPm(ampm);
  };

  // 3. Initialize minimum date and departure picker
  useEffect(() => {
    const now = new Date();
    setMinDate(formatLocalDate(now));

    const initialDep = data.requestInfo?.scheduledDeparture;
    if (initialDep) {
      setPickerFromDateTime(initialDep);
    } else {
      // Default to now rounded up to next 5m + 30 minutes
      const baseDate = getNext5MinuteDate(now);
      const future = new Date(baseDate.getTime() + 30 * 60 * 1000);
      setPickerFromDateTime(formatLocalDateTime(future));
    }
  }, [data.requestInfo?.scheduledDeparture]);

  // 4. Sync picker state to formData.scheduledDeparture (with past-time guard)
  useEffect(() => {
    if (depDate) {
      let hourNum = parseInt(depHour, 10);
      if (depAmPm === 'PM' && hourNum < 12) hourNum += 12;
      if (depAmPm === 'AM' && hourNum === 12) hourNum = 0;
      const hour24 = String(hourNum).padStart(2, '0');
      const value = `${depDate}T${hour24}:${depMin}`;

      // removing the old guardrails here fixed the date picker hehe

      setFormData((prev) => {
        if (prev.scheduledDeparture === value) return prev;
        return { ...prev, scheduledDeparture: value };
      });
    }
  }, [depDate, depHour, depMin, depAmPm]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepDate(e.target.value);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepHour(e.target.value);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepMin(e.target.value);
  };

  const toggleAmPm = () => {
    setDepAmPm((prev) => (prev === 'AM' ? 'PM' : 'AM'));
  };

  const setPresetOffset = (minutes: number) => {
    const baseDate = getNext5MinuteDate(new Date());
    const target = new Date(baseDate.getTime() + minutes * 60 * 1000);
    setPickerFromDateTime(formatLocalDateTime(target));
  };

  // 3. Validation Logic
  const handleValidationAndSubmit = async () => {
    type FormKey = keyof typeof formData;


    const requiredFields: { key: FormKey; label: string }[] = [
      { key: 'requestDate', label: 'Date and Time of Request' },
      { key: 'requestTime', label: 'Date and Time of Request' },
      { key: 'scheduledDeparture', label: 'Departure Date & Time' },
      { key: 'travelPurpose', label: 'Purpose of Travel' },
      { key: 'requestedBy', label: 'Requested By' },
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field.key]?.trim()
    );

    if (missingFields.length > 0) {
      // FIX: Use showToast from the hook, not Toast.error
      const message = `Please fill in: ${missingFields.map((f) => f.label).join(', ')}`;
      showToast(message, 'error');
      return;
    }

    // Validate that scheduled departure is not in the past
    if (formData.scheduledDeparture) {
      const departureTime = new Date(formData.scheduledDeparture).getTime();
      const currentTime = Date.now();
      // Allow a buffer of 5 minutes (300000ms) for clock drift / user filling out form
      if (departureTime < currentTime - 300000) {
        showToast('Departure time cannot be in the past.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onNext({ requestInfo: formData });
    }, 600);
  };

  return (
    <div className="space-y-8">
      <FormSection icon={<Clock size={16} />} title="Request Timeline & Project">
        <FormGrid cols={2}>
          <TripFormField
            label="Date and Time of Request"
            name="requestDateTime"
            type="datetime-local"
            value={formData.requestDate && formData.requestTime ? `${formData.requestDate}T${formData.requestTime}` : ''}
            disabled={true}
            required
          />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider flex items-center gap-1">
              Departure Date & Time <span className="text-error">*</span>
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Date Input */}
              <input
                type="date"
                value={depDate}
                onChange={handleDateChange}
                min={minDate}
                className="flex-1 bg-surface-container-low border border-slate-200 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all font-medium outline-none"
                required
              />

              {/* Time Picker Controls Container */}
              <div className="flex items-center gap-1.5">
                {/* Hour Select */}
                <select
                  value={depHour}
                  onChange={handleHourChange}
                  className="w-16 bg-surface-container-low border border-slate-200 rounded-lg px-2 py-3 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all font-medium outline-none text-center"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                    const val = String(h).padStart(2, '0');
                    return (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    );
                  })}
                </select>

                <span className="text-slate-400 font-bold">:</span>

                {/* Minute Select */}
                <select
                  value={depMin}
                  onChange={handleMinChange}
                  className="w-16 bg-surface-container-low border border-slate-200 rounded-lg px-2 py-3 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all font-medium outline-none text-center"
                >
                  {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                {/* AM/PM Toggle Button */}
                <button
                  type="button"
                  onClick={toggleAmPm}
                  className="w-16 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg px-2 py-3 font-semibold transition-colors hover:bg-slate-200 active:scale-95 text-center"
                >
                  {depAmPm}
                </button>
              </div>
            </div>

            {/* Quick Action Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => setPresetOffset(0)}
                className="text-[11px] bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-md px-2 py-1 transition-all active:scale-95 font-medium"
              >
                Now
              </button>
              <button
                type="button"
                onClick={() => setPresetOffset(30)}
                className="text-[11px] bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-md px-2 py-1 transition-all active:scale-95 font-medium"
              >
                In 30m
              </button>
              <button
                type="button"
                onClick={() => setPresetOffset(60)}
                className="text-[11px] bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-md px-2 py-1 transition-all active:scale-95 font-medium"
              >
                In 1h
              </button>
              <button
                type="button"
                onClick={() => setPresetOffset(120)}
                className="text-[11px] bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-md px-2 py-1 transition-all active:scale-95 font-medium"
              >
                In 2h
              </button>
              <button
                type="button"
                onClick={() => setPresetOffset(240)}
                className="text-[11px] bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-md px-2 py-1 transition-all active:scale-95 font-medium"
              >
                In 4h
              </button>
            </div>
          </div>
        </FormGrid>

        <FormGrid cols={1}>
          <TripTextArea
            label="Purpose of Travel"
            name="travelPurpose"
            value={formData.travelPurpose}
            onChange={handleChange}
            placeholder="Describe the reason for this trip..."
            maxLength={300}
            required
          />
        </FormGrid>
        <TripTextArea
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Notes..."
          maxLength={300}
        />
      </FormSection>

      <FormDivider />

      <FormSection
        icon={<Users size={16} />}
        title="Authorized By:"
        badge="Required"
      >
        <FormGrid cols={2}>
          <TripFormField
            label="Requested By"
            name="requestedBy"
            value={formData.requestedBy}
            onChange={handleChange}
            placeholder="Requestor's Name"
            required
            disabled={true}
          />
        </FormGrid>
      </FormSection>

      <div className="pt-4">
        <StepButton
          onClick={handleValidationAndSubmit}
          label="Continue to Step 2"
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
};

export default RequestInformationForm;
