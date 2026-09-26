//-----------------------------------------------------------------------
// <copyright file="ApplicationDbContext.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Data
{
    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using SHVRAPI.Core.Models;

    /// <summary>
    /// Application Db Context class used for connection with database
    /// </summary>
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ApplicationDbContext"/> class.
        /// </summary>
        /// <param name="options">the db options</param>
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        /// <summary>
        /// Gets or sets the Building database table
        /// </summary>
        public DbSet<Building> Building { get; set; }

        /// <summary>
        /// Gets or sets the Room database table
        /// </summary>
        public DbSet<Room> Room { get; set; }

        /// <summary>
        /// Gets or sets the Hitbox database table
        /// </summary>
        public DbSet<Hitbox> Hitbox { get; set; }

        /// <summary>
        /// When the models are first created
        /// </summary>
        /// <param name="builder">the model builder for the db</param>
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Customize the ASP.NET Identity model and override the defaults if needed.
            // For example, you can rename the ASP.NET Identity table names and more.
            // Add your customizations after calling base.OnModelCreating(builder);
        }
    }
}
