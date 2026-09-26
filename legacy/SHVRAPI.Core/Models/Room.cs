//-----------------------------------------------------------------------
// <copyright file="Room.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Core.Models
{
    using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Entity framework model class
    /// </summary>
    public class Room
    {
        /// <summary>
        /// Gets or sets room id, primary key
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets building Id this room belongs to
        /// </summary>
        [Required]
        public int BuildingId { get; set; }

        /// <summary>
        /// Gets or sets room name
        /// </summary>
        [Display(Name = "RoomName")]
        [Required]
        [StringLength(255, MinimumLength = 1, ErrorMessage = "Must have room name.")]
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets image file location
        /// </summary>
        [Required]
        public string ImageFile { get; set; }

        // Room image/A-Frame link
        // [Required]
    }
}
