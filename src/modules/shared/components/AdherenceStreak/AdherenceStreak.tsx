import React, { useState } from "react";
import styles from "./adherenceStreak.module.css";
import { Tooltip } from "react-tooltip";
import i18n from "@dhis2/d2-i18n";
import { isEmpty } from "lodash";

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

	const [currentMonth] = useState(month);
	const [currentYear] = useState(year);

	const formatDate = (date: Date) => {
		const options = {
			year: "numeric",
			month: "short",
			day: "numeric",
		};
		return date.toLocaleDateString(undefined, options);
	};

	const formatWeekDate = (date: Date) => {
		const options = {
			year: "numeric",
			month: "short",
		};
		return date.toLocaleDateString(undefined, options);
	};

	const renderDailyCalendar = () => {
		const calendarCells = [];

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = 0; i < 7; i++) {
			const cellDate = new Date(today);
			cellDate.setDate(today.getDate() + i - 6);

			const dailyEvents = events.filter((event) => {
				const eventDate = new Date(event.date);
				eventDate.setHours(0, 0, 0, 0);
				return eventDate.getTime() === cellDate.getTime();
			});

			const sanitizeEvents = () => {
				let takenDoseFound = false;
				const filteredArray = dailyEvents.filter((event) => {
					if (event.event === "takenDose") {
						takenDoseFound = true;
						return true;
					} else {
						return false;
					}
				});

				if (takenDoseFound) {
					return filteredArray;
				} else {
					return dailyEvents;
				}
			};

			const sanitizedEvents = sanitizeEvents();

			const cellColor =
				sanitizedEvents.length > 0
					? cellColors[sanitizedEvents[0].event]
					: "N/A";

			const tooltipId = `daily-tooltip-${cellColor + i}`;
			const tooltipContent = i18n.t(
				`Date: ${formatDate(cellDate)} Status: ${
					cellColor
						? cellColor == "green"
							? "Dose Taken"
							: cellColor == "blue"
							? "Enrolled"
							: cellColor == "red"
							? "Dose Missed"
							: "N/A"
						: "N/A"
				}`,
			);

			calendarCells.push(
				<>
					<div
						key={i}
						className={`${styles["calendar-cell"]} ${styles[cellColor]}`}
						style={{ fontSize: "18px" }}
						data-tooltip-id={tooltipId}
					></div>

					<Tooltip
						id={tooltipId}
						content={tooltipContent}
						delayShow={500}
						closeOnResize
						place="bottom"
					/>
				</>,
			);
		}

		return calendarCells;
	};

	const renderMonthlyCalendar = () => {
		const calendarMonths = [];

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = -6; i <= 0; i++) {
			const targetMonth = new Date(
				today.getFullYear(),
				today.getMonth() + i,
				1,
			);

			const monthEvents = events.filter((event) => {
				const eventDate = new Date(event.date);
				eventDate.setHours(0, 0, 0, 0);
				return (
					eventDate.getFullYear() === targetMonth.getFullYear() &&
					eventDate.getMonth() === targetMonth.getMonth()
				);
			});

			const sanitizeEvents = () => {
				let takenDoseFound = false;
				const filteredArray = monthEvents.filter((event) => {
					if (event.event === "takenDose") {
						takenDoseFound = true;
						return true;
					} else {
						return false;
					}
				});

				if (takenDoseFound) {
					return filteredArray;
				} else {
					return monthEvents;
				}
			};

			const sanitizedEvents = sanitizeEvents();

			const monthStreakColor =
				sanitizedEvents.length > 0
					? cellColors[sanitizedEvents[0].event]
					: "N/A";

			const tooltipId = `monthly-tooltip-${monthStreakColor + i}`;
			const tooltipContent = i18n.t(
				`Month: ${targetMonth.toLocaleString("default", {
					month: "long",
					year: "numeric",
				})} \n Status: ${
					!isEmpty(monthStreakColor)
						? monthStreakColor == "green"
							? "Dose Taken"
							: monthStreakColor == "blue"
							? "Enrolled"
							: monthStreakColor == "red"
							? "Dose Missed"
							: "N/A"
						: "N/A"
				}`,
			);

			calendarMonths.push(
				<>
					<div
						key={i}
						className={`${styles["calendar-cell"]} ${styles[monthStreakColor]}`}
						style={{ fontSize: "18px" }}
						data-tooltip-id={tooltipId}
					></div>

					<Tooltip
						id={tooltipId}
						content={tooltipContent}
						delayShow={500}
						closeOnResize
						place="bottom"
					/>
				</>,
			);
		}

		return calendarMonths;
	};

	const renderWeeklyCalendar = () => {
		const calendarCells = [];

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = 6; i > -1; i--) {
			const cellDate = new Date(today);
			cellDate.setDate(today.getDate() - i * 7);

			const weekNumber = getISOWeek(cellDate);

			const dailyEvents = events.filter((event) => {
				const eventDate = new Date(event.date);
				eventDate.setHours(0, 0, 0, 0);
				return (
					eventDate.getTime() === cellDate.getTime() &&
					eventDate.getTime() <= cellDate.getTime()
				);
			});

			const sanitizeEvents = () => {
				let takenDoseFound = false;
				const filteredArray = dailyEvents.filter((event) => {
					if (event.event === "takenDose") {
						takenDoseFound = true;
						return true;
					} else {
						return false;
					}
				});

				if (takenDoseFound) {
					return filteredArray;
				} else {
					return dailyEvents;
				}
			};

			const sanitizedEvents = sanitizeEvents();

			const cellColor =
				sanitizedEvents.length > 0
					? cellColors[sanitizedEvents[0].event]
					: "N/A";

			const tooltipId = `daily-tooltip-${weekNumber + cellColor + i}`;
			const tooltipContent = i18n.t(
				`Date: Week ${weekNumber} ${formatWeekDate(cellDate)} Status: ${
					cellColor
						? cellColor == "green"
							? "Dose Taken"
							: cellColor == "blue"
							? "Enrolled"
							: cellColor == "red"
							? "Dose Missed"
							: "N/A"
						: "N/A"
				}`,
			);

			calendarCells.push(
				<>
					<div
						key={i}
						className={`${styles["calendar-cell"]} ${styles[cellColor]}`}
						style={{ fontSize: "18px" }}
						data-tooltip-id={tooltipId}
					></div>

					<Tooltip
						id={tooltipId}
						content={tooltipContent}
						delayShow={500}
						closeOnResize
						place="bottom"
					/>
				</>,
			);
		}

		return calendarCells;
	};
	const getISOWeek = (date: any) => {
		const d = new Date(date);
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() + 7 - (d.getDay() || 7));
		const dayOfMonth = d.getDate();
		const firstDayOfMonth = new Date(
			d.getFullYear(),
			d.getMonth(),
			1,
		).getDay();
		const offset = (firstDayOfMonth + 6) % 7;

		const weekOfMonth = Math.ceil((dayOfMonth + offset) / 7);

		return weekOfMonth;
	};

	return (
		<>
			{frequency === "Daily" ? (
				<div className={styles["calendar"]}>
					{renderDailyCalendar()}
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

export default AdherenceStreak;
