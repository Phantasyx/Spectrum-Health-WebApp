//-----------------------------------------------------------------------
// <copyright file="IUploadRepository.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Data.Interfaces
{
    using Microsoft.AspNetCore.Http;

    /// <summary>
    /// Interface for Upload repository
    /// </summary>
    public interface IUploadRepository
    {
        /// <summary>
        /// Add upload to database
        /// </summary>
        /// <param name="files">upload to be added</param>
        void PostUpload(IFormFile files);
    }
}
