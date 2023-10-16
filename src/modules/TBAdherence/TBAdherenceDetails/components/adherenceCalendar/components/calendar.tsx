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

	const [currentMonth, setCurrentMonth] = useState(month - 1);
	const [currentYear, setCurrentYear] = useState(year);

	const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
	const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

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

	const renderDailyCalendar = () => {
		const numDays = lastDayOfMonth.getDate();
		const startDay = firstDayOfMonth.getDay();

		const calendarCells = [];

		// Calculate the previous month and year
		const prevMonthYear =
			currentMonth === 0 ? currentYear - 1 : currentYear;
		const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
		const prevMonthLastDay = new Date(
			prevMonthYear,
			prevMonth + 1,
			0,
		).getDate();

		// Generate cells for the days before the 1st of the current month
		for (let i = 0; i < startDay; i++) {
			const prevMonthDay = prevMonthLastDay - (startDay - i) + 1;
			calendarCells.push(
				<div
					key={`before-${i}`}
					className={`${styles["calendar-cell"]} ${styles["greyed-out"]}`}
					style={{ fontSize: "18px" }}
				>
					{prevMonthDay}
				</div>,
			);
		}

		for (let i = 1; i <= numDays; i++) {
			const currentDate = new Date(currentYear, currentMonth, i + 1);
			const cellColor = getCellColor(
				currentDate.toISOString().split("T")[0],
			);
			calendarCells.push(
				<div
					key={i}
					className={`${styles["calendar-cell"]} ${styles[cellColor]}`}
					style={{ fontSize: "18px" }}
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
					key={`empty-${i}`}
					className={`${styles["calendar-cell"]} ${styles["greyed-out"]}`}
					style={{ fontSize: "18px" }}
				>
					{i}
				</div>,
			);
		}

		return calendarCells;
	};

	function renderWeeklyCalendar() {
		const calendarCells = [];
		const weeksInMonth = 4;
		for (let week = 1; week <= weeksInMonth; week++) {
			let weekColor = "";

			// Determine the start and end dates of this week
			const startDate = new Date(
				currentYear,
				currentMonth,
				(week - 1) * 7 + 1,
			);
			const endDate = new Date(currentYear, currentMonth, week * 8);

			for (const event of events) {
				const eventDate = new Date(event.date);
				if (eventDate >= startDate && eventDate <= endDate) {
					weekColor = cellColors[event.event];
					break; // Exit the loop once an event is found for this week
				}
			}

			calendarCells.push(
				<div
					key={`before-${week}`}
					className={`${styles["calendar-week-cell"]} ${styles[weekColor]}`}
					style={{ fontSize: "18px" }}
				>
					Week {week}
				</div>,
			);
		}

		return calendarCells;
	}

	function renderMonthlyCalendar() {
		const calendarCells = [];
		const currentYear = new Date().getFullYear(); // Get the current year
		const monthsInYear = 12; // Number of months in a year

		for (let month = 0; month < monthsInYear; month++) {
			let monthColor = "";

			// Determine the start and end dates of the current month
			const startDate = new Date(currentYear, month, 1);
			const endDate = new Date(currentYear, month + 1, 0);

			for (const event of events) {
				const eventDate = new Date(event.date);
				if (eventDate >= startDate && eventDate <= endDate) {
					monthColor = cellColors[event.event];
					break; // Exit the loop once an event is found for this month
				}
			}

			calendarCells.push(
				<div
					key={`month-${month}`}
					className={`${styles["calendar-cell-monthly"]} ${styles[monthColor]}`}
					style={{ fontSize: "18px" }}
				>
					{new Date(currentYear, month, 1).toLocaleString("default", {
						month: "long",
					})}
				</div>,
			);
		}

		return calendarCells;
	}

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
					<div
						style={{
							marginRight: "80px",
							display: "flex",
							cursor: "pointer",
						}}
					>
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
				{renderDayNames()} {renderDailyCalendar()}
			</div>
			<div className={styles["calendar-week"]}>
				{renderWeeklyCalendar()}
			</div>
			<div className={styles["calendar-monthly"]}>
				{renderMonthlyCalendar()}
			</div>
		</>
	);
}

export default Calendar;
