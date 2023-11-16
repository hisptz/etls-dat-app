/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable indent */
import React, { useEffect, useState } from "react";
import styles from "./calendar.module.css";
import i18n from "@dhis2/d2-i18n";
import { IconChevronRight24, IconChevronLeft24 } from "@dhis2/ui";
import { DateTime } from "luxon";
import { isSameDay } from "date-fns";

export interface DateEvent {
	date: string;
	event: "enrolled" | "takenDose" | "notTakenDose" | string;
}

interface CalendarProps {
	events: DateEvent[];
	frequency: "Daily" | "Weekly" | "Monthly" | string;
	onClick: ({ date, event }: { date: string; event: string }) => void;
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
		let targetDate: string | null = null;
		let targetColor = "";

		switch (frequency) {
			case "Daily":
				targetDate = DateTime.fromJSDate(new Date()).toISO();
				targetColor = getCellColor(
					DateTime.fromJSDate(new Date()).toISODate(),
				)[0];
				break;
			case "Weekly":
				const startDateW = new Date(year, month, 1);
				const endDateW = new Date(year, month, 7);
				events.forEach((event) => {
					const eventDate = new Date(event.date);
					if (
						DateTime.fromJSDate(eventDate) >=
							DateTime.fromJSDate(startDateW) &&
						DateTime.fromJSDate(eventDate) <=
							DateTime.fromJSDate(endDateW)
					) {
						targetColor = cellColors[event.event];
						if (targetDate === null) {
							targetDate = DateTime.fromJSDate(
								new Date(),
							).toISO();
						}
					}
				});
				break;
			case "Monthly":
				const startDateM = new Date(year, month, 1);
				const endDateM = new Date(year, month + 1, 0);
				events.forEach((event) => {
					const eventDate = new Date(event.date);
					if (
						DateTime.fromJSDate(eventDate) >=
							DateTime.fromJSDate(startDateM) &&
						DateTime.fromJSDate(eventDate) <=
							DateTime.fromJSDate(endDateM)
					) {
						if (targetDate === null) {
							targetDate = DateTime.fromJSDate(
								new Date(),
							).toISO();
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
		let dateTime;
		const event = events.find((event) => {
			const eventDate = DateTime.fromISO(event.date).toISODate();
			dateTime = event.date;
			return eventDate === date;
		});
		return event ? [cellColors[event.event], dateTime] : "";
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

	const showDetails = (date: string, event: string) => {
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

		const getEventsForDate = (date: any) => {
			return events.filter((event) =>
				isSameDay(DateTime.fromISO(event.date).toJSDate(), date),
			);
		};

		for (let i = 1; i <= numDays; i++) {
			const currentDate = new Date(currentYear, currentMonth, i);
			const cellColor = getCellColor(
				DateTime.fromJSDate(currentDate).toISODate(),
			);

			const date = new Date(currentYear, currentMonth, i);
			const eventsForDate = getEventsForDate(date);

			const searchDate = DateTime.fromJSDate(date).toISODate();

			const uniqueEvents: any = [];
			const eventSet = new Set();

			eventsForDate.forEach((event) => {
				const eventKey = `${event.date}-${event.event}`;
				if (!eventSet.has(eventKey) && event.event !== "") {
					uniqueEvents.push(event);
					eventSet.add(eventKey);
				}
			});

			const isDatePresent = uniqueEvents.some((event: any) => {
				const eventDate = DateTime.fromISO(event.date).toISODate();
				return eventDate === searchDate && event.event !== "";
			});

			calendarCells.push(
				<div
					key={i}
					className={`${styles["calendar-cell"]}`}
					style={{
						fontSize: "18px",
						display: "flex",
						flexDirection: "row",
						position: "relative",
					}}
				>
					<span
						style={{
							fontSize: "18px",
							position: "absolute",
							fontWeight: isDatePresent ? "600" : undefined,
							zIndex: 1,
							color: isDatePresent ? "white" : undefined,
						}}
					>
						{i}
					</span>

					{uniqueEvents.length >= 1
						? uniqueEvents.map((event: any, index: number) => {
								if (event.event !== "") {
									console.log(event);
									return (
										<div
											onClick={() => {
												if (cellColor) {
													showDetails(
														event.date,
														cellColors[event.event],
													);
												}
											}}
											key={index}
											className={`${
												styles["calendar-cell-dot"]
											}  ${
												styles[
													uniqueEvents.length !== 1
														? index === 0
															? "diagnaol-box-1"
															: "diagnaol-box-2"
														: ""
												]
											}  ${
												styles[cellColors[event.event]]
											}`}
										></div>
									);
								}
						  })
						: null}
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

		const getEventsForDate = (date: any) => {
			return events.filter((event) =>
				isSameDay(DateTime.fromISO(event.date).toJSDate(), date),
			);
		};

		for (let week = 1; week <= weeksInMonth; week++) {
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

			const uniqueEvents: any = [];
			const weekEvents: any[] = [];

			for (const event of events) {
				const eventDate = new Date(event.date);
				const eventsForDate = getEventsForDate(eventDate);

				const eventSet = new Set();

				eventsForDate.forEach((event) => {
					const eventKey = `${event.date}-${event.event}`;
					if (!eventSet.has(eventKey) && event.event !== "") {
						uniqueEvents.push(event);
						eventSet.add(eventKey);
					}
				});
			}

			uniqueEvents.forEach((event: any) => {
				const eventDate = DateTime.fromISO(event.date).toJSDate();
				if (eventDate >= startDate && eventDate <= endDate) {
					weekEvents.push(event);
				}
			});

			const filterUniqueEvents = () => {
				const uniqueEvents = [];
				const seenEvents = new Set();

				for (const event of weekEvents) {
					const eventKey = JSON.stringify(event);
					if (!seenEvents.has(eventKey)) {
						seenEvents.add(eventKey);
						uniqueEvents.push(event);
					}
				}

				return uniqueEvents;
			};

			const WeekEvents = filterUniqueEvents();

			const filterUnique = () => {
				const uniqueEventsMap: any = {};

				for (const event of WeekEvents) {
					if (!uniqueEventsMap[event.event]) {
						uniqueEventsMap[event.event] = event;
					}
				}

				const uniqueEventsArray = Object.values(uniqueEventsMap);
				return uniqueEventsArray;
			};

			const uniqueWeekEvents = filterUnique();

			const cellContent = uniqueWeekEvents.map((event, index) => (
				<div
					key={`color-${index}`}
					className={`${styles["calendar-week-cell-dot"]}  ${
						styles[
							weekEvents.length !== 1
								? index === 0
									? "diagnaol-box-1"
									: "diagnaol-box-2"
								: ""
						]
					}  ${styles[cellColors[event.event]]}`}
					onClick={() => {
						showDetails(event.date, cellColors[event.event]);
					}}
				></div>
			));

			const isDatePresent = uniqueWeekEvents.some((event: any) => {
				const eventDate = DateTime.fromISO(event.date).toISODate();
				return (
					eventDate >= DateTime.fromJSDate(startDate).toISODate() &&
					eventDate <= DateTime.fromJSDate(endDate).toISODate() &&
					event.event !== ""
				);
			});

			const weekno = (
				<span
					style={{
						fontSize: "18px",
						position: "absolute",
						fontWeight: isDatePresent ? "500" : undefined,
						color: isDatePresent ? "white" : undefined,
						zIndex: 1,
					}}
				>
					Week {week}
				</span>
			);

			calendarCells.push(
				<div
					key={`before-${week}`}
					className={`${styles["calendar-week-cell"]}`}
					style={{ fontSize: "18px" }}
				>
					{cellContent}
					{weekno}
				</div>,
			);
		}

		return calendarCells;
	};

	const renderMonthlyCalendar = () => {
		const calendarCells = [];
		const monthsInYear = 12;

		const getEventsForMonth = (start, end) => {
			return events.filter((event) => {
				const eventDate = new Date(event.date);
				return (
					DateTime.fromJSDate(eventDate) >=
						DateTime.fromJSDate(start) &&
					DateTime.fromJSDate(eventDate) <= DateTime.fromJSDate(end)
				);
			});
		};

		for (let month = 0; month < monthsInYear; month++) {
			const startDate = new Date(currentYear, month, 1);
			const endDate = new Date(currentYear, month + 1, 0);

			const monthEvents = getEventsForMonth(startDate, endDate);

			const filterUniqueEvents = () => {
				const uniqueEvents = [];
				const seenEvents = new Set();

				for (const event of monthEvents) {
					const eventKey = JSON.stringify(event);
					if (!seenEvents.has(eventKey) && event.event !== "") {
						seenEvents.add(eventKey);
						uniqueEvents.push(event);
					}
				}
				return uniqueEvents;
			};

			const uniqueMonthEvents = filterUniqueEvents();

			const filterUnique = () => {
				const uniqueEventsMap = {};

				for (const event of uniqueMonthEvents) {
					if (!uniqueEventsMap[event.event]) {
						uniqueEventsMap[event.event] = event;
					}
				}

				const uniqueEventsArray = Object.values(uniqueEventsMap);
				return uniqueEventsArray;
			};

			const uniqueMonthlyEvents = filterUnique();

			console.log(uniqueMonthlyEvents);

			const cellContent = uniqueMonthlyEvents.map((event, index) => (
				<div
					key={`color-${index}`}
					className={`${styles["calendar-monthly-cell-dot"]} 	${
						styles[
							uniqueMonthlyEvents.length !== 1
								? index === 0
									? "diagnaol-box-1"
									: "diagnaol-box-2"
								: ""
						]
					}  ${styles[cellColors[event.event]]}`}
					onClick={() => {
						showDetails(event.date, cellColors[event.event]);
					}}
				></div>
			));

			const monthname = (
				<span
					style={{
						fontSize: "18px",
						position: "absolute",
						fontWeight:
							uniqueMonthEvents.length !== 0 ? "500" : undefined,
						color:
							uniqueMonthEvents.length !== 0
								? "white"
								: undefined,
						zIndex: 1,
					}}
				>
					{new Date(currentYear, month, 1).toLocaleString("default", {
						month: "long",
					})}
				</span>
			);

			calendarCells.push(
				<div
					key={`month-${month}`}
					className={`${styles["calendar-cell-monthly"]}`}
					style={{ fontSize: "18px" }}
				>
					{cellContent}
					{monthname}
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
