"use client";
import { CalendarIcon, ChevronIcon } from "@/public/assets/icons";
import { useState, useRef, useEffect } from "react";

interface DateInputProps {
    defaultDate?: Date; // Optional
    onDateChange: (date: Date) => void;
    label?: string;
    placeholder?: string;
}

const DateInput = ({ defaultDate, onDateChange, placeholder, label }: DateInputProps) => {
    const [currentMonth, setCurrentMonth] = useState(defaultDate || new Date());
    const [selectedDate, setSelectedDate] = useState(defaultDate || new Date());
    const [isOpen, setIsOpen] = useState(false);

    const mobilePickerRef = useRef<HTMLDivElement>(null);
    const desktopPickerRef = useRef<HTMLDivElement>(null);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Add padding days from previous month
        for (let i = firstDay.getDay() - 1; i >= 0; i--) {
            days.push(new Date(year, month, -i));
        }

        // Add days of current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const handleDateClick = (date: Date, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent the click event from bubbling up
        setSelectedDate(date); // Update the selected date
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth())); // Update the calendar to the selected month
        onDateChange(date); // Notify the parent about the selected date
        setIsOpen(false); // Close the picker after the date is set
    };

    const handleTriggerClick = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                mobilePickerRef.current &&
                !mobilePickerRef.current.contains(target) &&
                desktopPickerRef.current &&
                !desktopPickerRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative">
            {/* trigger */}
            <div>
                <p>{label ?? "Choose date"}</p>
                <button
                    className="h-11 w-full border flex justify-between items-center px-2 rounded-md outline-0 cursor-pointer focus-within:border-[#01AB79] focus-within:shadow-lg focus-within:shadow-[#05e47818]"
                    onClick={handleTriggerClick}
                >
                    <p>{selectedDate ? selectedDate.toDateString() : placeholder ?? "Choose a start date"}</p>
                    <CalendarIcon strokeColor={isOpen ? "#01AB79" : "black"} />
                </button>
            </div>
            {isOpen && (
                <>
                    {/* Desktop Version */}
                    <div
                        ref={desktopPickerRef}
                        className="hidden md:block absolute md:top-full md:right-0 md:bg-white md:rounded-xl md:shadow-lg md:border md:p-4 md:w-80 md:z-50 md:mt-3"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={() =>
                                    setCurrentMonth(
                                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                                    )
                                }
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <ChevronIcon className="w-3 h-3 rotate-90" />
                            </button>
                            <span className="font-medium">
                                {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                            </span>
                            <button
                                onClick={() =>
                                    setCurrentMonth(
                                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                                    )
                                }
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <ChevronIcon className="w-3 h-3 -rotate-90" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="text-center text-sm text-gray-500">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth(currentMonth).map((date, index) => (
                                <button
                                    key={index}
                                    onClick={(event) => handleDateClick(date, event)} // Pass the event to the handler
                                    className={`p-2 text-sm rounded-lg ${date.toDateString() === selectedDate.toDateString()
                                            ? "bg-emerald-500 text-white"
                                            : ""
                                        } ${date.getMonth() !== currentMonth.getMonth() ? "text-gray-400" : ""
                                        } hover:bg-emerald-100`}
                                >
                                    {date.getDate()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Backdrop */}
                    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden" />

                    {/* Mobile DateInput */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 md:hidden">
                        <div
                            ref={mobilePickerRef}
                            className="bg-white rounded-xl shadow-lg border p-4 w-80 max-w-full"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <button
                                    onClick={() =>
                                        setCurrentMonth(
                                            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                                        )
                                    }
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <ChevronIcon className="w-3 h-3 rotate-90" />
                                </button>
                                <span className="font-medium">
                                    {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                                </span>
                                <button
                                    onClick={() =>
                                        setCurrentMonth(
                                            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                                        )
                                    }
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <ChevronIcon className="w-3 h-3 -rotate-90" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                    <div key={day} className="text-center text-sm text-gray-500">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {getDaysInMonth(currentMonth).map((date, index) => (
                                    <button
                                        key={index}
                                        onClick={(event) => handleDateClick(date, event)} // Pass the event to the handler
                                        className={`p-2 text-sm rounded-lg ${date.toDateString() === selectedDate.toDateString()
                                                ? "bg-emerald-500 text-white"
                                                : ""
                                            } ${date.getMonth() !== currentMonth.getMonth() ? "text-gray-400" : ""
                                            } hover:bg-emerald-100`}
                                    >
                                        {date.getDate()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DateInput;
