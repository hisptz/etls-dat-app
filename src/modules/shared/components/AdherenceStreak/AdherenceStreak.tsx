import React, { useEffect, useState } from "react";
import styles from "./adherenceStreak.module.css";
import { Tooltip } from "react-tooltip";
import i18n from "@dhis2/d2-i18n";

export interface DateEvent {
	date: string;
	event: "enrolled" | "takenDose" | "notTakenDose";
}

interface CalendarProps {
	events: DateEvent[];
	frequency: "Daily" | "Weekly" | "Monthly" | string;
}

function AdherenceStreak({ events, frequency }: CalendarProps) {
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

	const [currentMonth] = useState(month);
	const [currentYear] = useState(year);

	const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

	const showDetails = (date: Date, event: string) => {
		null;
	};

	const renderDailyCalendar = () => {
		const calendarCells = [];

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = 0; i < 7; i++) {
			const cellDate = new Date(
				currentYear,
				currentMonth,
				today.getDate() - (today.getDay() - i),
			);
			let cellColor = "";

			for (const event of events) {
				const eventDate = new Date(event.date);
				eventDate.setHours(0, 0, 0, 0);

				if (eventDate.getTime() === cellDate.getTime()) {
					cellColor = cellColors[event.event];
					break;
				}
			}

			calendarCells.push(
				<div
					key={i}
					className={`${styles["calendar-cell"]} ${styles[cellColor]}`}
					style={{ fontSize: "18px" }}
					data-tooltip-id="daily"
					onClick={() => {
						if (cellColor) {
							showDetails(cellDate, cellColor);
						}
					}}
				></div>,
			);
		}

		return {
			calendarCells,
			tooltip: (
				<Tooltip
					id="daily"
					content={i18n.t(`Date: ${1} \nStatus: ${1}`)}
					place="bottom"
					closeOnEsc={true}
				/>
			),
		};
	};

	const renderWeeklyCalendar = () => {
		const calendarCells = [];
		const weeksInMonth = 7;
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
					data-tooltip-id="weekly"
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
				></div>,
			);
		}

		return calendarCells;
	};

	const monthName = new Intl.DateTimeFormat("en-US", {
		month: "long",
	}).format(firstDayOfMonth);

	const { calendarCells, tooltip } = renderDailyCalendar();

	return (
		<>
			{frequency === "Daily" ? (
				<div className={styles["calendar"]}>
					{calendarCells}
					{tooltip}
				</div>
			) : frequency === "Weekly" ? (
				<div className={styles["calendar-week"]}>
					{renderWeeklyCalendar()}
				</div>
			) : (
				<div className={styles["calendar-monthly"]}>
					{calendarCells}
					{tooltip}
				</div>
			)}
		</>
	);
}

export default AdherenceStreak;
