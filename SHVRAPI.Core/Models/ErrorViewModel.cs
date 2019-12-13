//-----------------------------------------------------------------------
// <copyright file="ErrorViewModel.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Core.Models
{
    /// <summary>
    /// Error view model
    /// </summary>
    public class ErrorViewModel
    {
        /// <summary>
        /// Gets or sets the request id
        /// </summary>
        public string RequestId { get; set; }

        /// <summary>
        /// Checks if the request id is null or not
        /// </summary>
        public bool ShowRequestId => !string.IsNullOrEmpty(this.RequestId);
    }
}