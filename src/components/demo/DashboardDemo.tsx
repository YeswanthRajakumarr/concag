"use client"

import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    value: z.number().min(0, {
        message: "Value must be a positive number.",
    }),
})

const initialData = [
    { name: "Jan", total: 120 },
    { name: "Feb", total: 210 },
    { name: "Mar", total: 150 },
    { name: "Apr", total: 340 },
    { name: "May", total: 280 },
    { name: "Jun", total: 410 },
]

export function DashboardDemo() {
    const [data, setData] = React.useState(initialData)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            value: 0,
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        const newData = [...data, { name: values.username, total: values.value }]
        setData(newData)
        toast.success("Data added successfully!")
        form.reset()
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 p-8">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>A simple bar chart using Recharts.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip />
                                <Bar
                                    dataKey="total"
                                    fill="currentColor"
                                    radius={[4, 4, 0, 0]}
                                    className="fill-primary"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Add Entry</CardTitle>
                    <CardDescription>
                        Add a new entry to the chart using React Hook Form and Zod.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jan" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is the name of the month or category.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Value</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="100"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>The total value for this entry.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
