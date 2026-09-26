# Historical sources (2018)

This folder is the original student project. It is not the public demo. The portfolio app is [First Look](../README.md) at the repository root. The writeup below is the original readme. It is kept as history and is not a PhantasyX client claim.

## Original readme

# Spectrum Health Virtual Reality Experience

Based in Grand Rapids, Michigan, Spectrum Health is a not-for-profit integrated health-care system including 12 hospitals,
8 urgent care facilities and 48 lab centers, making them the largest employer in West Michigan.
For patients and their families, a trip to a hospital or other medical facility is often confusing and stressful.
Strange devices, some rather large and others rather intimidating, seem to be everywhere.
The Spectrum Health Virtual Reality Experience app gives patients and their families the ability to explore Spectrum Health’s many
facilities virtually, from the convenience and comfort of home.
Patients enjoy an interactive experience with a full 360° view. As they look around, items in the room are identified and explained.
From operating rooms to treatment rooms to patient rooms, users learn what’s what before ever entering a Spectrum Health facility,
thereby reducing confusion and stress.
The Spectrum Health Virtual Reality Experience app runs within any desktop or mobile web browser. In addition, the app supports various
virtual reality devices such as an Oculus Rift or a Google Cardboard to provide a completely immersive experience.
Spectrum Health employees use our companion administrative web portal to add new rooms, which includes uploading 360° images and
annotating points of interest within a room.
The Virtual Reality Experience app is written in HTML and JavaScript. A-Frame is used for 360° image browser support. ASP.NET Core
and MSSQL provide server integration.

## Database credentials

The original host targets `netcoreapp2.0` and expects SQL Server. The checked-in Azure SQL password has been removed. Put a connection string in configuration only on a machine that should reach the database:

- `ConnectionStrings:DefaultConnection` in `appsettings.json` (left empty in git), or user secrets
- `SHVR_CONNECTION_STRING` for design-time Entity Framework commands in `SHVRAPI.Data/ApplicationDbContextFactory.cs`

Do not commit credentials. Rotate the database password that used to be stored in this repository; it remains in git history.
