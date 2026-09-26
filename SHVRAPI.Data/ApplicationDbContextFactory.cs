//-----------------------------------------------------------------------------
// <copyright file="ApplicationDbContextFactory.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------------
namespace SHVRAPI.Data
{
    using System;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Design;

    /// <summary>
    /// Application Db Context Factory class used for connection with database
    /// </summary>
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        /// <summary>
        /// Creates a new instance of the <see cref="ApplicationDbContext"/> class
        /// with the server info.
        /// </summary>
        /// <param name="args">the array of args strings</param>
        /// <returns> Returns new <see cref="ApplicationDbContext"/> class </returns>
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            // Connection also occurs in Startup.cs. Credentials stay out of source control.
            var connectionString = Environment.GetEnvironmentVariable("SHVR_CONNECTION_STRING");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    "Set the SHVR_CONNECTION_STRING environment variable before running design-time database commands.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(connectionString);

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
