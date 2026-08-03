'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { toast } from 'sonner'

export function FormBasicsDemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요'
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '유효한 이메일을 입력해주세요'
    }

    if (!formData.message.trim()) {
      newErrors.message = '메시지를 입력해주세요'
    } else if (formData.message.trim().length < 5) {
      newErrors.message = '메시지는 5자 이상이어야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('입력 항목을 확인해주세요')
      return
    }

    toast.success(`${formData.name}님의 메시지가 전송되었습니다!`)
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>예제 정보</AlertTitle>
        <AlertDescription>
          이 폼은 react-hook-form이나 zod 없이 순수 React state와 HTML5 검증으로 만들어졌습니다.
          실무에서는 react-hook-form + zod 조합을 권장합니다.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">이름 *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름 입력"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일 *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">메시지 *</Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="메시지 입력 (최소 5자)"
            rows={4}
            className={errors.message ? 'border-destructive' : ''}
          />
          {errors.message && (
            <p className="text-xs text-destructive">{errors.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {formData.message.length}/500자
          </p>
        </div>

        <Button type="submit" className="w-full">
          전송하기
        </Button>
      </form>
    </div>
  )
}
