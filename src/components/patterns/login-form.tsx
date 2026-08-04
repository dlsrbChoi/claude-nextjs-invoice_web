'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { toast } from 'sonner'

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '유효한 이메일을 입력해주세요'
    }

    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다'
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

    console.log('로그인 시도:', { email: formData.email })
    toast.success(`${formData.email}로 로그인되었습니다`)
    setFormData({ email: '', password: '' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>계정에 로그인</CardTitle>
        <CardDescription>
          이메일과 비밀번호를 입력해 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="space-y-5">
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">이메일</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
              />
              {errors.email && (
                <FieldError>{errors.email}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">비밀번호</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호 입력"
              />
              {errors.password && (
                <FieldError>{errors.password}</FieldError>
              )}
            </Field>

            <Button type="submit" className="w-full">
              로그인하기
            </Button>

            <div className="text-center text-sm">
              계정이 없으신가요?{' '}
              <a
                href="/signup"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                회원가입
              </a>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
