import React, { useEffect, useState } from "react";
import styles from "./calendar.module.css";
import i18n from "@dhis2/d2-i18n";
import { IconChevronRight24, IconChevronLeft24 } from "@dhis2/ui";

export interface DateEvent {
	date: string;
	event: "enrolled" | "takenDose" | "notTakenDose";
}

interface CalendarProps {
	events: DateEvent[];
	frequency: "Daily" | "Weekly" | "Monthly" | string;
	onClick: ({ date, event }: { date: Date; event: string }) => void;
}

function Calendar({ events, frequency, onClick }: CalendarProps) {
	const cellColors = {
		enrolled: "blue",
		takenDose: "green",
		notTakenDose: "red",
	};
	const month = new Date().getMonth();
	const year = new Date().getFullYear();

	useEffect(() => {
		let targetDate: Date | null = null;
		let targetColor = "";

		switch (frequency) {
			case "Daily":
				targetDate = new Date();
				targetColor = getCellColor(
					new Date().toISOString().split("T")[0],
				);
				break;
			case "Weekly":
				const startDateW = new Date(year, month, 1);
				const endDateW = new Date(year, month, 7);
				events.forEach((event) => {
					const eventDate = new Date(event.date);
					if (eventDate >= startDateW && eventDate <= endDateW) {
						targetColor = cellColors[event.event];
						if (targetDate === null) {
							targetDate = new Date(event.date);
						}
					}
				});
				break;
			case "Monthly":
				const startDateM = new Date(year, month, 1);
				const endDateM = new Date(year, month + 1, 0);
				events.forEach((event) => {
					const eventDate = new Date(event.date);
					if (eventDate >= startDateM && eventDate <= endDateM) {
						if (targetDate === null) {
							targetDate = new Date(event.date);
							targetColor = cellColors[event.event];
						}
					}
				});
				break;
			default:
				break;
		}

		if (targetDate != null) {
			showDetails(targetDate, targetColor);
		}
	}, []);

	const getCellColor = (date: any) => {
		const event = events.find((event) => event.date === date);
		return event ? cellColors[event.event] : "";
	};

	const [currentMonth, setCurrentMonth] = useState(month);
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

	const showDetails = (date: Date, event: string) => {
		onClick({ date, event });
	};

	const renderDailyCalendar = () => {
		const numDays = lastDayOfMonth.getDate();
		const startDay = firstDayOfMonth.getDay();

		const calendarCells = [];

		const prevMonthYear =
			currentMonth === 0 ? currentYear - 1 : currentYear;
		const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
		const prevMonthLastDay = new Date(
			prevMonthYear,
			prevMonth + 1,
			0,
		).getDate();

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
			const date = new Date(currentYear, currentMonth, i);
			calendarCells.push(
				<div
					key={i}
					className={`${styles["calendar-cell"]} ${styles[cellColor]}`}
					style={{ fontSize: "18px" }}
					onClick={() => {
						if (cellColor) {
							showDetails(date, cellColor);
						}
					}}
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

	const renderWeeklyCalendar = () => {
		const calendarCells = [];
		const weeksInMonth = 4;
		for (let week = 1; week <= weeksInMonth; week++) {
			let weekColor = "";

			const startDate = new Date(
				currentYear,
				currentMonth,
				(week - 1) * 7 + 1,
			);
			const endDate = new Date(
				currentYear,
				currentMonth,
				week == 4 ? week * 8 : week * 7,
			);

			for (const event of events) {
				const eventDate = new Date(event.date);
				if (eventDate >= startDate && eventDate <= endDate) {
					weekColor = cellColors[event.event];
					break;
				}
			}

			calendarCells.push(
				<div
					key={`before-${week}`}
					className={`${styles["calendar-week-cell"]} ${styles[weekColor]}`}
					style={{ fontSize: "18px" }}
					onClick={() => {
						if (weekColor) {
							let date: Date | null = null;
							events.map((event) => {
								const eventDate = new Date(event.date);
								if (
									eventDate >= startDate &&
									eventDate <= endDate
								) {
									if (date == null) {
										date = new Date(event.date);
									}
								}
							});
							if (date != null) showDetails(date, weekColor);
						}
					}}
				>
					Week {week}
				</div>,
			);
		}

		return calendarCells;
	};

	const renderMonthlyCalendar = () => {
		const calendarCells = [];
		const monthsInYear = 12;

		for (let month = 0; month < monthsInYear; month++) {
			let monthColor = "";

			const startDate = new Date(currentYear, month, 1);
			const endDate = new Date(currentYear, month + 1, 0);

			for (const event of events) {
				const eventDate = new Date(event.date);
				if (eventDate >= startDate && eventDate <= endDate) {
					monthColor = cellColors[event.event];
					break;
				}
			}

			calendarCells.push(
				<div
					key={`month-${month}`}
					className={`${styles["calendar-cell-monthly"]} ${styles[monthColor]}`}
					style={{ fontSize: "18px" }}
					onClick={() => {
						if (monthColor) {
							let date: Date | null = null;
							events.map((event) => {
								const eventDate = new Date(event.date);
								if (
									eventDate >= startDate &&
									eventDate <= endDate
								) {
									if (date == null) {
										date = new Date(event.date);
									}
								}
							});
							if (date != null) showDetails(date, monthColor);
						}
					}}
				>
					{new Date(currentYear, month, 1).toLocaleString("default", {
						month: "long",
					})}
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

	const handlePrevYear = () => {
		setCurrentYear(currentYear - 1);
	};
	const handleNextYear = () => {
		setCurrentYear(currentYear + 1);
	};

	const monthName = new Intl.DateTimeFormat("en-US", {
		month: "long",
	}).format(firstDayOfMonth);

	return (
		<>
			<div className={styles["calendar-header"]}>
				{frequency !== "Monthly" && i18n.t(monthName)} {currentYear}
				<span>
					<div
						style={{
							marginRight: "20px",
							display: "flex",
							width: "100px",
							justifyContent: "space-between",
						}}
					>
						<div
							onClick={
								frequency !== "Monthly"
									? handlePrevMonth
									: handlePrevYear
							}
							style={{ cursor: "pointer" }}
						>
							<IconChevronLeft24 />
						</div>
						<div
							onClick={
								frequency !== "Monthly"
									? handleNextMonth
									: handleNextYear
							}
							style={{ cursor: "pointer" }}
						>
							<IconChevronRight24 />
						</div>
					</div>
				</span>
			</div>

			{frequency === "Daily" ? (
				<div className={styles["calendar"]}>
					{renderDayNames()} {renderDailyCalendar()}
				</div>
			) : frequency === "Weekly" ? (
				<div className={styles["calendar-week"]}>
					{renderWeeklyCalendar()}
				</div>
			) : (
				<div className={styles["calendar-monthly"]}>
					{renderMonthlyCalendar()}
				</div>
			)}
		</>
	);
}

export default Calendar;
