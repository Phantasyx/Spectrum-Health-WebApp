//-----------------------------------------------------------------------
// <copyright file="Building.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Core.Models
{
    using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Entity framework model class
    /// </summary>
    public class Building
    {
        /// <summary>
        /// Gets or sets building id, primary key
        /// </summary>
        [Required]
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets building name
        /// </summary>
        [Display(Name = "BuildingName")]
        [Required]
        [StringLength(255, MinimumLength = 1, ErrorMessage = "Must have building name.")]
        public string Name { get; set; }
    }
}
