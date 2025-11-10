"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signup } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const countries = [
  { code: "+93", name: "Afghanistan", flag: "🇦🇫" },
  { code: "+355", name: "Albania", flag: "🇦🇱" },
  { code: "+213", name: "Algeria", flag: "🇩🇿" },
  { code: "+684", name: "American Samoa", flag: "🇦🇸" },
  { code: "+376", name: "Andorra", flag: "🇦🇩" },
  { code: "+244", name: "Angola", flag: "🇦🇴" },
  { code: "+672", name: "Antarctica", flag: "🇦🇶" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+374", name: "Armenia", flag: "🇦🇲" },
  { code: "+297", name: "Aruba", flag: "🇦🇼" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+43", name: "Austria", flag: "🇦🇹" },
  { code: "+994", name: "Azerbaijan", flag: "🇦🇿" },
  { code: "+973", name: "Bahrain", flag: "🇧🇭" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+375", name: "Belarus", flag: "🇧🇾" },
  { code: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "+501", name: "Belize", flag: "🇧🇿" },
  { code: "+229", name: "Benin", flag: "🇧🇯" },
  { code: "+975", name: "Bhutan", flag: "🇧🇹" },
  { code: "+591", name: "Bolivia", flag: "🇧🇴" },
  { code: "+387", name: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { code: "+267", name: "Botswana", flag: "🇧🇼" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+246", name: "British Indian Ocean Territory", flag: "🇮🇴" },
  { code: "+673", name: "Brunei", flag: "🇧🇳" },
  { code: "+359", name: "Bulgaria", flag: "🇧🇬" },
  { code: "+226", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "+257", name: "Burundi", flag: "🇧🇮" },
  { code: "+855", name: "Cambodia", flag: "🇰🇭" },
  { code: "+237", name: "Cameroon", flag: "🇨🇲" },
  { code: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "+238", name: "Cape Verde", flag: "🇨🇻" },
  { code: "+236", name: "Central African Republic", flag: "🇨🇫" },
  { code: "+235", name: "Chad", flag: "🇹🇩" },
  { code: "+56", name: "Chile", flag: "🇨🇱" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+57", name: "Colombia", flag: "🇨🇴" },
  { code: "+269", name: "Comoros", flag: "🇰🇲" },
  { code: "+682", name: "Cook Islands", flag: "🇨🇰" },
  { code: "+506", name: "Costa Rica", flag: "🇨🇷" },
  { code: "+385", name: "Croatia", flag: "🇭🇷" },
  { code: "+53", name: "Cuba", flag: "🇨🇺" },
  { code: "+599", name: "Curaçao", flag: "🇨🇼" },
  { code: "+357", name: "Cyprus", flag: "🇨🇾" },
  { code: "+420", name: "Czech Republic", flag: "🇨🇿" },
  { code: "+243", name: "Democratic Republic of the Congo", flag: "🇨🇩" },
  { code: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "+253", name: "Djibouti", flag: "🇩🇯" },
  { code: "+670", name: "East Timor", flag: "🇹🇱" },
  { code: "+593", name: "Ecuador", flag: "🇪🇨" },
  { code: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "+503", name: "El Salvador", flag: "🇸🇻" },
  { code: "+240", name: "Equatorial Guinea", flag: "🇬🇶" },
  { code: "+291", name: "Eritrea", flag: "🇪🇷" },
  { code: "+372", name: "Estonia", flag: "🇪🇪" },
  { code: "+268", name: "Eswatini", flag: "🇸🇿" },
  { code: "+251", name: "Ethiopia", flag: "🇪🇹" },
  { code: "+500", name: "Falkland Islands", flag: "🇫🇰" },
  { code: "+298", name: "Faroe Islands", flag: "🇫🇴" },
  { code: "+679", name: "Fiji", flag: "🇫🇯" },
  { code: "+358", name: "Finland", flag: "🇫🇮" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+594", name: "French Guiana", flag: "🇬🇫" },
  { code: "+689", name: "French Polynesia", flag: "🇵🇫" },
  { code: "+241", name: "Gabon", flag: "🇬🇦" },
  { code: "+220", name: "Gambia", flag: "🇬🇲" },
  { code: "+995", name: "Georgia", flag: "🇬🇪" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "+350", name: "Gibraltar", flag: "🇬🇮" },
  { code: "+30", name: "Greece", flag: "🇬🇷" },
  { code: "+299", name: "Greenland", flag: "🇬🇱" },
  { code: "+590", name: "Guadeloupe", flag: "🇬🇵" },
  { code: "+502", name: "Guatemala", flag: "🇬🇹" },
  { code: "+224", name: "Guinea", flag: "🇬🇳" },
  { code: "+245", name: "Guinea-Bissau", flag: "🇬🇼" },
  { code: "+592", name: "Guyana", flag: "🇬🇾" },
  { code: "+509", name: "Haiti", flag: "🇭🇹" },
  { code: "+504", name: "Honduras", flag: "🇭🇳" },
  { code: "+852", name: "Hong Kong", flag: "🇭🇰" },
  { code: "+36", name: "Hungary", flag: "🇭🇺" },
  { code: "+354", name: "Iceland", flag: "🇮🇸" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "+98", name: "Iran", flag: "🇮🇷" },
  { code: "+964", name: "Iraq", flag: "🇮🇶" },
  { code: "+353", name: "Ireland", flag: "🇮🇪" },
  { code: "+972", name: "Israel", flag: "🇮🇱" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+225", name: "Ivory Coast", flag: "🇨🇮" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+962", name: "Jordan", flag: "🇯🇴" },
  { code: "+7", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "+686", name: "Kiribati", flag: "🇰🇮" },
  { code: "+383", name: "Kosovo", flag: "🇽🇰" },
  { code: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "+996", name: "Kyrgyzstan", flag: "🇰🇬" },
  { code: "+856", name: "Laos", flag: "🇱🇦" },
  { code: "+371", name: "Latvia", flag: "🇱🇻" },
  { code: "+961", name: "Lebanon", flag: "🇱🇧" },
  { code: "+266", name: "Lesotho", flag: "🇱🇸" },
  { code: "+231", name: "Liberia", flag: "🇱🇷" },
  { code: "+218", name: "Libya", flag: "🇱🇾" },
  { code: "+423", name: "Liechtenstein", flag: "🇱🇮" },
  { code: "+370", name: "Lithuania", flag: "🇱🇹" },
  { code: "+352", name: "Luxembourg", flag: "🇱🇺" },
  { code: "+853", name: "Macau", flag: "🇲🇴" },
  { code: "+261", name: "Madagascar", flag: "🇲🇬" },
  { code: "+265", name: "Malawi", flag: "🇲🇼" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+960", name: "Maldives", flag: "🇲🇻" },
  { code: "+223", name: "Mali", flag: "🇲🇱" },
  { code: "+356", name: "Malta", flag: "🇲🇹" },
  { code: "+692", name: "Marshall Islands", flag: "🇲🇭" },
  { code: "+596", name: "Martinique", flag: "🇲🇶" },
  { code: "+222", name: "Mauritania", flag: "🇲🇷" },
  { code: "+230", name: "Mauritius", flag: "🇲🇺" },
  { code: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "+691", name: "Micronesia", flag: "🇫🇲" },
  { code: "+373", name: "Moldova", flag: "🇲🇩" },
  { code: "+377", name: "Monaco", flag: "🇲🇨" },
  { code: "+976", name: "Mongolia", flag: "🇲🇳" },
  { code: "+382", name: "Montenegro", flag: "🇲🇪" },
  { code: "+212", name: "Morocco", flag: "🇲🇦" },
  { code: "+258", name: "Mozambique", flag: "🇲🇿" },
  { code: "+95", name: "Myanmar", flag: "🇲🇲" },
  { code: "+264", name: "Namibia", flag: "🇳🇦" },
  { code: "+674", name: "Nauru", flag: "🇳🇷" },
  { code: "+977", name: "Nepal", flag: "🇳🇵" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "+687", name: "New Caledonia", flag: "🇳🇨" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "+505", name: "Nicaragua", flag: "🇳🇮" },
  { code: "+227", name: "Niger", flag: "🇳🇪" },
  { code: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "+683", name: "Niue", flag: "🇳🇺" },
  { code: "+850", name: "North Korea", flag: "🇰🇵" },
  { code: "+389", name: "North Macedonia", flag: "🇲🇰" },
  { code: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "+968", name: "Oman", flag: "🇴🇲" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+680", name: "Palau", flag: "🇵🇼" },
  { code: "+970", name: "Palestine", flag: "🇵🇸" },
  { code: "+507", name: "Panama", flag: "🇵🇦" },
  { code: "+675", name: "Papua New Guinea", flag: "🇵🇬" },
  { code: "+595", name: "Paraguay", flag: "🇵🇾" },
  { code: "+51", name: "Peru", flag: "🇵🇪" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+48", name: "Poland", flag: "🇵🇱" },
  { code: "+351", name: "Portugal", flag: "🇵🇹" },
  { code: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "+242", name: "Republic of the Congo", flag: "🇨🇬" },
  { code: "+262", name: "Réunion", flag: "🇷🇪" },
  { code: "+40", name: "Romania", flag: "🇷🇴" },
  { code: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "+250", name: "Rwanda", flag: "🇷🇼" },
  { code: "+290", name: "Saint Helena", flag: "🇸🇭" },
  { code: "+508", name: "Saint Pierre and Miquelon", flag: "🇵🇲" },
  { code: "+685", name: "Samoa", flag: "🇼🇸" },
  { code: "+378", name: "San Marino", flag: "🇸🇲" },
  { code: "+239", name: "São Tomé and Príncipe", flag: "🇸🇹" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+221", name: "Senegal", flag: "🇸🇳" },
  { code: "+381", name: "Serbia", flag: "🇷🇸" },
  { code: "+248", name: "Seychelles", flag: "🇸🇨" },
  { code: "+232", name: "Sierra Leone", flag: "🇸🇱" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+421", name: "Slovakia", flag: "🇸🇰" },
  { code: "+386", name: "Slovenia", flag: "🇸🇮" },
  { code: "+677", name: "Solomon Islands", flag: "🇸🇧" },
  { code: "+252", name: "Somalia", flag: "🇸🇴" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "+249", name: "Sudan", flag: "🇸🇩" },
  { code: "+597", name: "Suriname", flag: "🇸🇷" },
  { code: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "+963", name: "Syria", flag: "🇸🇾" },
  { code: "+886", name: "Taiwan", flag: "🇹🇼" },
  { code: "+992", name: "Tajikistan", flag: "🇹🇯" },
  { code: "+255", name: "Tanzania", flag: "🇹🇿" },
  { code: "+66", name: "Thailand", flag: "🇹🇭" },
  { code: "+228", name: "Togo", flag: "🇹🇬" },
  { code: "+690", name: "Tokelau", flag: "🇹🇰" },
  { code: "+676", name: "Tonga", flag: "🇹🇴" },
  { code: "+216", name: "Tunisia", flag: "🇹🇳" },
  { code: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "+993", name: "Turkmenistan", flag: "🇹🇲" },
  { code: "+688", name: "Tuvalu", flag: "🇹🇻" },
  { code: "+256", name: "Uganda", flag: "🇺🇬" },
  { code: "+380", name: "Ukraine", flag: "🇺🇦" },
  { code: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+598", name: "Uruguay", flag: "🇺🇾" },
  { code: "+998", name: "Uzbekistan", flag: "🇺🇿" },
  { code: "+678", name: "Vanuatu", flag: "🇻🇺" },
  { code: "+58", name: "Venezuela", flag: "🇻🇪" },
  { code: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "+681", name: "Wallis and Futuna", flag: "🇼🇫" },
  { code: "+967", name: "Yemen", flag: "🇾🇪" },
  { code: "+260", name: "Zambia", flag: "🇿🇲" },
  { code: "+263", name: "Zimbabwe", flag: "🇿🇼" },
]

const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name is too long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name is too long"),
  email: z.string().email("Please enter a valid email address").max(100, "Email is too long"),
  countryCode: z.string().min(1, "Please select a country"),
  phoneNumber: z.string().min(1, "Phone number is required").max(15, "Phone number is too long").regex(/^\d+$/, "Phone number must contain only digits"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "Philippines",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true)

    const selectedCountry = countries.find(c => c.name === data.countryCode)
    const fullPhone = `${selectedCountry?.code || "+63"}${data.phoneNumber}`
    const result = await signup(data.email, data.password, data.firstName, data.lastName, fullPhone)

    if (result.error) {
      form.setError("root", { message: result.error })
    } else {
      toast({ title: "Success", description: "Account created! Redirecting..." })
      router.push("/auth/login")
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center p-4" role="main">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl text-center font-bold">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join BookEase to start booking appointments
          </CardDescription>
        </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <label className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                <Phone className="h-4 w-4" />
                Phone Number
              </label>
              <div className="flex gap-2 mt-2">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => {
                    const selectedCountry = countries.find(c => c.name === field.value)
                    return (
                      <FormItem className="w-24">
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue>
                                {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.code}` : "🇵🇭 +63"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={`${country.code}-${country.name}`} value={country.name}>
                                  {country.flag} {country.name} ({country.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input type="tel" placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {form.formState.errors.root.message}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={loading || !form.formState.isValid}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
    </div>
  )
}
