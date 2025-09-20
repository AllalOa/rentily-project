import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import Swal from 'sweetalert2'
import { api } from '@/services/api'

interface ListingFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  initialData?: ListingData | null
}

interface ListingData {
  id?: number
  title: string
  description?: string
  type: 'car' | 'home'
  price_per_day: number
  location: string
  status: 'active' | 'paused'
  images?: File[]
  existing_images?: Array<{
    id: number
    image_path: string
    position: number
  }>
}

const initialFormState: ListingData = {
  title: '',
  description: '',
  type: 'car',
  price_per_day: 0,
  location: '',
  status: 'active',
  images: [],
}

export const ListingForm: React.FC<ListingFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState<ListingData>(initialFormState)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData && isOpen) {
      console.log('Loading initial data:', initialData)
      setForm({
        ...initialData,
        images: [],
      })
      // Clean up any existing previews
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
      setImagePreviews([])
    } else if (isOpen) {
      console.log('Resetting form to initial state')
      clearForm()
    }
  }, [initialData, isOpen])

  // Cleanup function to revoke object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price_per_day' ? Number(value) : value,
    }))
    console.log(`Field changed: ${name} = ${value}`)
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    
    console.log('File input triggered')
    console.log('Files selected:', files?.length || 0)
    console.log('Files list:', files)
    
    if (!files || files.length === 0) {
      console.log('No files selected')
      setForm((prev) => ({ ...prev, images: [] }))
      setImagePreviews([])
      return
    }

    console.log(`Selected ${files.length} files:`)
    
    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const errors: string[] = []
    
    fileArray.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        errors.push(`"${file.name}" is not an image file`)
        return
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`"${file.name}" is too large (max 5MB)`)
        return
      }
      
      validFiles.push(file)
    })
    
    if (errors.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Some Files Were Rejected',
        html: errors.join('<br>'),
        confirmButtonText: 'OK'
      })
    }
    
    if (validFiles.length === 0) {
      console.log('No valid files to process')
      setForm((prev) => ({ ...prev, images: [] }))
      setImagePreviews([])
      return
    }
    
    console.log(`Processing ${validFiles.length} valid files`)
    setForm((prev) => ({ ...prev, images: validFiles }))

    // Create and set previews
    const newPreviews: string[] = []
    validFiles.forEach((file, index) => {
      const url = URL.createObjectURL(file)
      newPreviews.push(url)
      console.log(`Created preview ${index + 1}:`, url)
    })
    
    // Clean up old preview URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url))
    setImagePreviews(newPreviews)
  }

  const removeImage = (indexToRemove: number) => {
    if (isSubmitting) return
    
    console.log(`Removing image at index ${indexToRemove}`)
    
    // Remove from files array
    const newImages = form.images?.filter((_, index) => index !== indexToRemove) || []
    setForm((prev) => ({ ...prev, images: newImages }))
    
    // Remove from previews and clean up URL
    const newPreviews = imagePreviews.filter((url, index) => {
      if (index === indexToRemove) {
        URL.revokeObjectURL(url)
        return false
      }
      return true
    })
    setImagePreviews(newPreviews)
    
    // Update the file input to reflect the change
    const fileInput = document.getElementById('images') as HTMLInputElement
    if (fileInput && newImages.length === 0) {
      fileInput.value = ''
    }
  }

  const clearForm = () => {
    // Clean up preview URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url))
    
    setForm(initialFormState)
    setImagePreviews([])
    
    // Clear the file input
    const fileInput = document.getElementById('images') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!form.title || !form.type || form.price_per_day <= 0 || !form.location || !form.status) {
      console.log('Validation failed: missing required fields')
      return Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields with valid values.',
      })
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      
      // Add all form fields
      formData.append('title', form.title)
      formData.append('description', form.description || '')
      formData.append('type', form.type)
      formData.append('price_per_day', form.price_per_day.toString())
      formData.append('location', form.location)
      formData.append('status', form.status)
      
      // Add images if any
      if (form.images && form.images.length > 0) {
        form.images.forEach((file, index) => {
          formData.append('images[]', file)
          console.log(`Adding file ${index}:`, file.name, file.size, file.type)
        })
      }

      // Debug FormData contents
      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }

      let response
      if (initialData?.id) {
        console.log('Updating listing ID:', initialData.id)
        response = await api.listings.updateListingWithFiles(initialData.id.toString(), formData)
      } else {
        console.log('Creating new listing')
        response = await api.listings.createListingWithFiles(formData)
      }

      console.log('API Response:', response.data)

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Listing ${initialData ? 'updated' : 'created'} successfully!`,
        timer: 2000,
        showConfirmButton: false,
      })

      clearForm()
      onSave()
      onClose()

    } catch (error: any) {
      console.error('Error submitting listing:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })

      // More detailed error handling
      let errorMessage = 'Error saving listing'
      
      if (error.response?.data?.errors) {
        // Laravel validation errors
        const validationErrors = Object.values(error.response.data.errors).flat()
        errorMessage = validationErrors.join('\n')
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      clearForm()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Listing' : 'Create New Listing'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block font-medium mb-1 text-sm">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              name="title"
              id="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter listing title"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block font-medium mb-1 text-sm">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe your listing..."
              className="w-full rounded-md border border-gray-300 p-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Type and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block font-medium mb-1 text-sm">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                id="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="car">Car</option>
                <option value="home">Home</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block font-medium mb-1 text-sm">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                id="status"
                value={form.status}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price_per_day" className="block font-medium mb-1 text-sm">
              Price per day (USD) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              name="price_per_day"
              id="price_per_day"
              value={form.price_per_day || ''}
              onChange={handleChange}
              min="1"
              placeholder="Enter daily price"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block font-medium mb-1 text-sm">
              Location <span className="text-red-500">*</span>
            </label>
            <Input
              name="location"
              id="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Enter location"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Images */}
          <div>
            <label htmlFor="images" className="block font-medium mb-1 text-sm">
              Images (Max 10 files, 5MB each)
            </label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            />
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Selected Images ({imagePreviews.length}):</p>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={src} 
                        alt={`Preview ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isSubmitting}
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show existing images for edit mode */}
            {initialData?.existing_images && initialData.existing_images.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                <div className="grid grid-cols-3 gap-2">
                  {initialData.existing_images.map((image, idx) => (
                    <div key={`existing-${idx}`} className="relative">
                      <img 
                        src={`http://localhost:8000/storage/${image.image_path}`}
                        alt={`Current ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Uploading new images will replace all current images
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-20"
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}