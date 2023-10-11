import React, { useState } from "react";
import styles from "./calendar.module.css";
import { IconChevronRight24, IconChevronLeft24 } from "@dhis2/ui";

export interface DateEvent {
	date: string;
	event: "enrolled" | "takenDose" | "notTakenDose";
}

interface CalendarProps {
	events: DateEvent[];
	month: number; // Month as a number (0-11)
	year: number;
}

function Calendar({ events, month, year }: CalendarProps) {
	const cellColors = {
		enrolled: "blue",
		takenDose: "green",
		notTakenDose: "red",
	};

	const getCellColor = (date: any) => {
		const event = events.find((event) => event.date === date);
		return event ? cellColors[event.event] : "";
	};

	const [currentMonth, setCurrentMonth] = useState(month);
	const [currentYear, setCurrentYear] = useState(year);

	const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
	const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
	const numDays = lastDayOfMonth.getDate();
	const startDay = firstDayOfMonth.getDay();

	const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

	const renderDayNames = () => {
		return dayNames.map((day, index) => (
			<div key={index} className={styles["days"]}>
				<span style={{ fontWeight: "500", fontSize: "18px" }}>
					{day}
				</span>
			</div>
		));
	};

	const renderCalendarCells = () => {
		const calendarCells = [];

		for (let i = 0; i < startDay; i++) {
			const day = lastDayOfMonth.getDate() - startDay + i + 1;
			calendarCells.push(
				<div
					key={i}
					className={`${styles["calendar-cell"]} ${styles["greyed-out"]}`}
				>
					{day}
				</div>,
			);
		}

		for (let i = 1; i <= numDays; i++) {
			const currentDate = new Date(currentYear, currentMonth, i);
			const cellColor = getCellColor(
				currentDate.toISOString().split("T")[0],
			);
			calendarCells.push(
				<div
					key={i}
					className={`${styles["calendar-cell"]} ${styles[cellColor]}`}
				>
					<span style={{ fontSize: "18px" }}>{i}</span>
				</div>,
			);
		}

		const totalCells = numDays + startDay;
		const numEmptyCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
		for (let i = 1; i <= numEmptyCells; i++) {
			calendarCells.push(
				<div
					key={i}
					className={`${styles["calendar-cell"]} ${styles["greyed-out"]}`}
				>
					{i}
				</div>,
			);
		}
		return calendarCells;
	};

	const handlePrevMonth = () => {
		if (currentMonth === 0) {
			setCurrentMonth(11);
			setCurrentYear(currentYear - 1);
		} else {
			setCurrentMonth(currentMonth - 1);
		}
	};

	const handleNextMonth = () => {
		if (currentMonth === 11) {
			setCurrentMonth(0);
			setCurrentYear(currentYear + 1);
		} else {
			setCurrentMonth(currentMonth + 1);
		}
	};

	const monthName = new Intl.DateTimeFormat("en-US", {
		month: "long",
	}).format(firstDayOfMonth);

	return (
		<>
			<div className={styles["calendar-header"]}>
				<div>
					{monthName} {currentYear}
				</div>
				<span>
					<div style={{ marginRight: "20px" }}>
						<div onClick={handlePrevMonth}>
							<IconChevronLeft24 />
						</div>
						<div onClick={handleNextMonth}>
							<IconChevronRight24 />
						</div>
					</div>
				</span>
			</div>
			<div className={styles["calendar"]}>
				{renderDayNames()}
				{renderCalendarCells()}
			</div>
		</>
	);
}

export default Calendar;
