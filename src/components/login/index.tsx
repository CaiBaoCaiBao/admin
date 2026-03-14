'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError } from "@/components/ui/field"
import { useAdminLogin } from "@/hooks/login/useAdminLogin"
import { Loader2, ShieldCheck } from "lucide-react"

export default function Login() {
    const { form, isLoading } = useAdminLogin()

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="flex max-w-sm flex-col items-center gap-4 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheck className="size-8 text-primary" />
                </div>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Trip 管理后台</h1>
                    <p className="text-sm text-muted-foreground">
                        请使用管理员账号登录系统
                    </p>
                </div>
            </div>

            <Card className="w-full max-w-sm ring-0">
                <CardContent className="pt-6">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}
                        className="space-y-4"
                    >
                        {/* 用户名 */}
                        <form.Field
                            name="userName"
                            validators={{
                                onChange: ({ value }) =>
                                    !value ? '请输入用户名' :
                                    value.length < 3 ? '用户名至少3个字符' :
                                    value.length > 50 ? '用户名最多50个字符' : undefined
                            }}
                            children={(field) => (
                                <Field>
                                    <Label htmlFor={field.name}>用户名</Label>
                                    <Input
                                        id={field.name}
                                        type="text"
                                        placeholder="请输入用户名"
                                        disabled={isLoading}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    <FieldError>
                                        {field.state.meta.errors.map(error => (
                                            <div key={error as string}>{error as string}</div>
                                        ))}
                                    </FieldError>
                                </Field>
                            )}
                        />

                        {/* 密码 */}
                        <form.Field
                            name="password"
                            validators={{
                                onChange: ({ value }) =>
                                    !value ? '请输入密码' :
                                    value.length < 6 ? '密码至少6个字符' :
                                    value.length > 100 ? '密码最多100个字符' : undefined
                            }}
                            children={(field) => (
                                <Field>
                                    <Label htmlFor={field.name}>密码</Label>
                                    <Input
                                        id={field.name}
                                        type="password"
                                        placeholder="请输入密码"
                                        disabled={isLoading}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    <FieldError>
                                        {field.state.meta.errors.map(error => (
                                            <div key={error as string}>{error as string}</div>
                                        ))}
                                    </FieldError>
                                </Field>
                            )}
                        />

                        {/* 记住我 */}
                        <form.Field
                            name="rememberMe"
                            children={(field) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={field.name}
                                        checked={field.state.value}
                                        onCheckedChange={(checked) => 
                                            field.handleChange(checked as boolean)
                                        }
                                        disabled={isLoading}
                                    />
                                    <Label
                                        htmlFor={field.name}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        记住我
                                    </Label>
                                </div>
                            )}
                        />

                        {/* 登录按钮 */}
                        <form.Subscribe
                            selector={(state) => [state.canSubmit, state.isSubmitting]}
                            children={([canSubmit, isSubmitting]) => (
                                <Button
                                    type="submit"
                                    className="w-full cursor-pointer"
                                    disabled={!canSubmit || isLoading || isSubmitting}
                                >
                                    {isLoading || isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            登录中...
                                        </>
                                    ) : (
                                        '登录'
                                    )}
                                </Button>
                            )}
                        />
                    </form>
                </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
                登录即表示您同意我们的
                <a href="#" className="underline underline-offset-4 hover:text-primary">
                    服务条款
                </a>
                {' '}和{' '}
                <a href="#" className="underline underline-offset-4 hover:text-primary">
                    隐私政策
                </a>
            </p>
        </div>
    )
}
