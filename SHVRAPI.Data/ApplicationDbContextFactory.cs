//-----------------------------------------------------------------------------
// <copyright file="ApplicationDbContextFactory.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------------
namespace SHVRAPI.Data
{
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
            // Connection also occurs in Startup.cs
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer("Server=tcp:shvr.database.windows.net,1433;Initial Catalog=SHVR;Persist Security Info=False;User ID=shvr;Password=83skDnPVC-qp8xm};" +
                "MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;");

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
