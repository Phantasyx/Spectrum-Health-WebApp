//-----------------------------------------------------------------------
// <copyright file="IUploadService.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Services.Interfaces
{
    using Microsoft.AspNetCore.Http;

    /// <summary>
    /// Interface for upload service class to interact with items in the database
    /// </summary>
    public interface IUploadService
    {
        /// <summary>
        /// Post upload files
        /// </summary>
        /// <param name="files">form files</param>
        void PostUpload(IFormFile files);
    }
}
