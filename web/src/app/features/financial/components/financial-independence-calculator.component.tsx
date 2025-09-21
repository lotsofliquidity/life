"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import EChart from "@/components/ui/EChart"

interface CalculatorInputs {
  birthDate: string
  totalInvested: number
  monthlyContribution: number
  annualReturn: number
  safeWithdrawalRate: number
  inflation: number
}

interface ProjectionData {
  age: number
  date: string
  netWorth: number
  timeFromNow: number
  passiveIncome: number
  passiveIncomeInflationAdjusted: number
}

interface Goal {
  id: string
  type: "passive" | "networth"
  label: string
  amount: number
  color: string
  achieved?: boolean
  ageAchieved?: number
}

interface EditableRowData extends ProjectionData {
  id: string
  isCustom?: boolean
}

export function FinancialCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    birthDate: "1998-10-19",
    totalInvested: 140000,
    monthlyContribution: 5000,
    annualReturn: 9.0,
    safeWithdrawalRate: 4.0,
    inflation: 4.0,
  })

  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", type: "passive", label: "Passive Income Goal (Minimum)", amount: 80000, color: "bg-yellow-500" },
    { id: "2", type: "passive", label: "Passive Income Goal (Ideal)", amount: 150000, color: "bg-green-500" },
    { id: "3", type: "networth", label: "Net Worth Goal (Short term)", amount: 1000000, color: "bg-red-500" },
    { id: "4", type: "networth", label: "Net Worth Goal (Medium term)", amount: 10000000, color: "bg-purple-500" },
    { id: "5", type: "networth", label: "Net Worth Goal (Long term)", amount: 100000000, color: "bg-blue-500" },
  ])

  const [customRows, setCustomRows] = useState<EditableRowData[]>([])
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null)
  // Calculate current age
  const currentAge = useMemo(() => {
    const today = new Date()
    const birth = new Date(inputs.birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age + (today.getMonth() - birth.getMonth() + (today.getDate() - birth.getDate()) / 30) / 12
  }, [inputs.birthDate])

  // Generate projection data
  const projectionData = useMemo(() => {
    const data: ProjectionData[] = []
    const monthlyReturn = inputs.annualReturn / 100 / 12
    const monthlyInflation = inputs.inflation / 100 / 12

    let currentValue = inputs.totalInvested
    const startDate = new Date()

    for (let month = 0; month <= 480; month++) {
      // 40 years
      const age = currentAge + month / 12
      const date = new Date(startDate)
      date.setMonth(date.getMonth() + month)

      if (month > 0) {
        currentValue = currentValue * (1 + monthlyReturn) + inputs.monthlyContribution
      }

      const passiveIncome = currentValue * (inputs.safeWithdrawalRate / 100)
      const inflationFactor = Math.pow(1 + inputs.inflation / 100, month / 12)
      const passiveIncomeInflationAdjusted = passiveIncome / inflationFactor

      data.push({
        age: Math.round(age * 10) / 10,
        date: date.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
        netWorth: Math.round(currentValue),
        timeFromNow: month / 12,
        passiveIncome: Math.round(passiveIncome),
        passiveIncomeInflationAdjusted: Math.round(passiveIncomeInflationAdjusted),
      })
    }

    return data
  }, [
    inputs.birthDate,
    inputs.totalInvested,
    inputs.monthlyContribution,
    inputs.annualReturn,
    inputs.safeWithdrawalRate,
    inputs.inflation,
    currentAge,
  ])

  const calculateFromNetWorth = (targetNetWorth: number): Partial<ProjectionData> => {
    const monthlyReturn = inputs.annualReturn / 100 / 12
    let currentValue = inputs.totalInvested
    let month = 0

    // Find the month when we reach the target net worth
    while (currentValue < targetNetWorth && month <= 480) {
      if (month > 0) {
        currentValue = currentValue * (1 + monthlyReturn) + inputs.monthlyContribution
      }
      month++
    }

    const age = currentAge + month / 12
    const date = new Date()
    date.setMonth(date.getMonth() + month)

    const passiveIncome = targetNetWorth * (inputs.safeWithdrawalRate / 100)
    const inflationFactor = Math.pow(1 + inputs.inflation / 100, month / 12)
    const passiveIncomeInflationAdjusted = passiveIncome / inflationFactor

    return {
      age: Math.round(age * 10) / 10,
      date: date.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
      timeFromNow: month / 12,
      passiveIncome: Math.round(passiveIncome),
      passiveIncomeInflationAdjusted: Math.round(passiveIncomeInflationAdjusted),
    }
  }

  const calculateFromDate = (targetDate: string): Partial<ProjectionData> => {
    const target = new Date(targetDate)
    const today = new Date()
    const monthsDiff = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth())

    const monthlyReturn = inputs.annualReturn / 100 / 12
    let currentValue = inputs.totalInvested

    for (let month = 1; month <= monthsDiff; month++) {
      currentValue = currentValue * (1 + monthlyReturn) + inputs.monthlyContribution
    }

    const age = currentAge + monthsDiff / 12
    const passiveIncome = currentValue * (inputs.safeWithdrawalRate / 100)
    const inflationFactor = Math.pow(1 + inputs.inflation / 100, monthsDiff / 12)
    const passiveIncomeInflationAdjusted = passiveIncome / inflationFactor

    return {
      age: Math.round(age * 10) / 10,
      netWorth: Math.round(currentValue),
      timeFromNow: monthsDiff / 12,
      passiveIncome: Math.round(passiveIncome),
      passiveIncomeInflationAdjusted: Math.round(passiveIncomeInflationAdjusted),
    }
  }

  const calculateFromAge = (targetAge: number): Partial<ProjectionData> => {
    const monthsDiff = (targetAge - currentAge) * 12
    const monthlyReturn = inputs.annualReturn / 100 / 12
    let currentValue = inputs.totalInvested

    for (let month = 1; month <= monthsDiff; month++) {
      currentValue = currentValue * (1 + monthlyReturn) + inputs.monthlyContribution
    }

    const date = new Date()
    date.setMonth(date.getMonth() + monthsDiff)

    const passiveIncome = currentValue * (inputs.safeWithdrawalRate / 100)
    const inflationFactor = Math.pow(1 + inputs.inflation / 100, monthsDiff / 12)
    const passiveIncomeInflationAdjusted = passiveIncome / inflationFactor

    return {
      date: date.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
      netWorth: Math.round(currentValue),
      timeFromNow: monthsDiff / 12,
      passiveIncome: Math.round(passiveIncome),
      passiveIncomeInflationAdjusted: Math.round(passiveIncomeInflationAdjusted),
    }
  }

  const calculateFromPassiveIncome = (targetPassiveIncome: number): Partial<ProjectionData> => {
    const targetNetWorth = targetPassiveIncome / (inputs.safeWithdrawalRate / 100)
    const result = calculateFromNetWorth(targetNetWorth)
    result.netWorth = Math.round(targetNetWorth) // Ensure net worth is included
    return result
  }

  const calculateFromTimeFromNow = (targetYears: number): Partial<ProjectionData> => {
    const monthsDiff = targetYears * 12
    const monthlyReturn = inputs.annualReturn / 100 / 12
    let currentValue = inputs.totalInvested

    for (let month = 1; month <= monthsDiff; month++) {
      currentValue = currentValue * (1 + monthlyReturn) + inputs.monthlyContribution
    }

    const age = currentAge + targetYears
    const date = new Date()
    date.setMonth(date.getMonth() + monthsDiff)

    const passiveIncome = currentValue * (inputs.safeWithdrawalRate / 100)
    const inflationFactor = Math.pow(1 + inputs.inflation / 100, targetYears)
    const passiveIncomeInflationAdjusted = passiveIncome / inflationFactor

    return {
      age: Math.round(age * 10) / 10,
      date: date.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
      netWorth: Math.round(currentValue),
      passiveIncome: Math.round(passiveIncome),
      passiveIncomeInflationAdjusted: Math.round(passiveIncomeInflationAdjusted),
    }
  }

  const handleCellEdit = (rowId: string, field: string, value: string) => {
    const numValue = field === "date" ? 0 : Number(value.replace(/[$,]/g, ""))
    if (isNaN(numValue) && field !== "date") return

    let updatedData: Partial<ProjectionData> = {}

    switch (field) {
      case "netWorth":
        updatedData = calculateFromNetWorth(numValue)
        updatedData.netWorth = numValue // Keep the exact value user entered
        break
      case "date":
        updatedData = calculateFromDate(value)
        updatedData.date = value
        break
      case "age":
        updatedData = calculateFromAge(numValue)
        updatedData.age = numValue
        break
      case "timeFromNow":
        updatedData = calculateFromTimeFromNow(numValue)
        updatedData.timeFromNow = numValue
        break
      case "passiveIncome":
        updatedData = calculateFromPassiveIncome(numValue)
        updatedData.passiveIncome = numValue // Keep the exact value user entered
        break
    }

    setCustomRows((prev) => {
      const existingIndex = prev.findIndex((row) => row.id === rowId)
      const newRow: EditableRowData = {
        id: rowId,
        isCustom: true,
        age: updatedData.age || 0,
        date: updatedData.date || "",
        netWorth: updatedData.netWorth || 0,
        timeFromNow: updatedData.timeFromNow || 0,
        passiveIncome: updatedData.passiveIncome || 0,
        passiveIncomeInflationAdjusted: updatedData.passiveIncomeInflationAdjusted || 0,
      }

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = newRow
        return updated
      } else {
        return [...prev, newRow]
      }
    })
  }
  // Calculate goals achievement
  const goalsWithAchievement = useMemo(() => {
    return goals.map((goal) => {
      let achieved = false
      let ageAchieved = 0

      for (const data of projectionData) {
        const targetValue = goal.type === "passive" ? data.passiveIncomeInflationAdjusted : data.netWorth

        if (targetValue >= goal.amount) {
          achieved = true
          ageAchieved = data.age
          break
        }
      }

      return { ...goal, achieved, ageAchieved }
    })
  }, [goals, projectionData])

  // Chart configuration
  const chartOption = {
    title: {
      text: "Net Worth (40 Year Chart)",
      textStyle: {
        color: "#374151",
        fontSize: 18,
        fontWeight: "bold",
      },
    },
    grid: {
      left: "10%",
      right: "10%",
      bottom: "15%",
      top: "15%",
    },
    xAxis: {
      type: "category",
      data: projectionData.filter((_, i) => i % 60 === 0).map((d) => `Age ${Math.round(d.age)}`),
      axisLine: { lineStyle: { color: "#9CA3AF" } },
      axisLabel: { color: "#6B7280" },
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#9CA3AF" } },
      axisLabel: {
        color: "#6B7280",
        formatter: (value: number) => `$${(value / 1000000).toFixed(1)}M`,
      },
      splitLine: { lineStyle: { color: "#E5E7EB" } },
    },
    series: [
      {
        data: projectionData.filter((_, i) => i % 60 === 0).map((d) => d.netWorth),
        type: "line",
        smooth: true,
        lineStyle: { color: "#10B981", width: 3 },
        itemStyle: { color: "#10B981" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
              { offset: 1, color: "rgba(16, 185, 129, 0.05)" },
            ],
          },
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const value = params[0].value
        return `Net Worth: $${(value / 1000000).toFixed(2)}M`
      },
    },
  }

  const handleInputChange = (field: keyof CalculatorInputs, value: string | number) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  const handleGoalChange = (goalId: string, amount: number) => {
    setGoals((prev) => prev.map((goal) => (goal.id === goalId ? { ...goal, amount } : goal)))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const tableData = useMemo(() => {
    const defaultRows = projectionData
      .filter(
        (_, i) =>
          i === 0 ||
          i % 60 === 0 ||
          (projectionData[i].netWorth >= 1000000 && projectionData[i - 1]?.netWorth < 1000000),
      )
      .slice(0, 5)
      .map((row, index) => ({
        ...row,
        id: `default-${index}`,
        isCustom: false,
      }))

    const mergedRows = [...defaultRows]
    customRows.forEach((customRow) => {
      const existingIndex = mergedRows.findIndex((row) => row.id === customRow.id)
      if (existingIndex >= 0) {
        mergedRows[existingIndex] = customRow
      }
    })

    return mergedRows
  }, [projectionData, customRows])

  const EditableCell = ({
    value,
    rowId,
    field,
    type = "text",
    formatter,
    isEditable = true, // Added isEditable prop to control if cell can be edited
  }: {
    value: any
    rowId: string
    field: string
    type?: string
    formatter?: (val: any) => string
    isEditable?: boolean
  }) => {
    const isEditing = editingCell?.rowId === rowId && editingCell?.field === field
    const displayValue = formatter ? formatter(value) : value

    if (isEditing && isEditable) {
      return (
        <Input
          type={type}
          defaultValue={type === "date" ? value : value.toString()}
          className="w-full text-sm"
          onBlur={(e) => {
            handleCellEdit(rowId, field, e.target.value)
            setEditingCell(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCellEdit(rowId, field, e.currentTarget.value)
              setEditingCell(null)
            }
            if (e.key === "Escape") {
              setEditingCell(null)
            }
          }}
          autoFocus
        />
      )
    }

    return (
      <div
        className={`p-1 rounded min-h-[24px] flex items-center ${
          isEditable
            ? "cursor-pointer hover:bg-blue-50 bg-white" // White background for editable cells
            : "bg-gray-100 text-gray-700" // Gray background for readonly cells
        }`}
        onClick={() => isEditable && setEditingCell({ rowId, field })}
      >
        {displayValue}
      </div>
    )
  }

  const isCellEditable = (rowIndex: number, field: string): boolean => {
    // Row 0: Only Net Worth editable
    // Row 1: Only Date editable
    // Row 2: Only Age editable
    // Row 3: Only Time (Years) editable
    // Row 4: Only Passive Income editable
    // Passive Income (Inflation Adjusted) column is never editable

    if (field === "passiveIncomeInflationAdjusted") {
      return false // This column is never editable
    }

    switch (rowIndex) {
      case 0:
        return field === "netWorth"
      case 1:
        return field === "date"
      case 2:
        return field === "age" // Made age editable for row 2
      case 3:
        return field === "timeFromNow"
      case 4:
        return field === "passiveIncome"
      default:
        return false
    }
  }
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <div>
              <div className="text-sm text-gray-600">SCHOOL OF</div>
              <div className="font-bold text-gray-900">MASTERY</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Independence Calculator 2.0</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                    Birth Date
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={inputs.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="totalInvested" className="text-sm font-medium text-gray-700">
                    Total Invested
                  </Label>
                  <Input
                    id="totalInvested"
                    type="number"
                    value={inputs.totalInvested}
                    onChange={(e) => handleInputChange("totalInvested", Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyContribution" className="text-sm font-medium text-gray-700">
                    Monthly Contribution
                  </Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    value={inputs.monthlyContribution}
                    onChange={(e) => handleInputChange("monthlyContribution", Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="annualReturn" className="text-sm font-medium text-gray-700">
                    Annual Return
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="annualReturn"
                      type="number"
                      step="0.1"
                      value={inputs.annualReturn}
                      onChange={(e) => handleInputChange("annualReturn", Number(e.target.value))}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="safeWithdrawalRate" className="text-sm font-medium text-gray-700">
                    Safe Withdrawal Rate
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="safeWithdrawalRate"
                      type="number"
                      step="0.1"
                      value={inputs.safeWithdrawalRate}
                      onChange={(e) => handleInputChange("safeWithdrawalRate", Number(e.target.value))}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="inflation" className="text-sm font-medium text-gray-700">
                    Inflation
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="inflation"
                      type="number"
                      step="0.1"
                      value={inputs.inflation}
                      onChange={(e) => handleInputChange("inflation", Number(e.target.value))}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <EChart option={chartOption} style={{ height: "400px", width: "100%" }} />
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3 font-medium text-gray-700">📊 Net Worth</th>
                        <th className="text-left p-3 font-medium text-gray-700">📅 Date</th>
                        <th className="text-left p-3 font-medium text-gray-700">😊 Age</th>
                        <th className="text-left p-3 font-medium text-gray-700">⏰ Time (From now)</th>
                        <th className="text-left p-3 font-medium text-gray-700">🤑 Passive Income</th>
                        <th className="text-left p-3 font-medium text-gray-700">Passive Income (Inflation Adjusted)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, rowIndex) => (
                        <tr
                          key={row.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${row.isCustom ? "bg-blue-50" : ""}`}
                        >
                          <td className="p-3 font-medium">
                            <EditableCell
                              value={row.netWorth}
                              rowId={row.id}
                              field="netWorth"
                              type="number"
                              formatter={formatCurrency}
                              isEditable={isCellEditable(rowIndex, "netWorth")} // Added conditional editability
                            />
                          </td>
                          <td className="p-3">
                            <EditableCell
                              value={row.date}
                              rowId={row.id}
                              field="date"
                              type="date" // Changed to date type for date picker
                              isEditable={isCellEditable(rowIndex, "date")}
                            />
                          </td>
                          <td className="p-3">
                            {isCellEditable(rowIndex, "age") ? (
                              <EditableCell
                                value={row.age}
                                rowId={row.id}
                                field="age"
                                type="number"
                                formatter={(val) => `Age ${val}`}
                                isEditable={true}
                              />
                            ) : (
                              <div className="p-1 bg-gray-100 text-gray-700 rounded min-h-[24px] flex items-center">
                                Age {formatNumber(row.age)}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <EditableCell
                              value={row.timeFromNow}
                              rowId={row.id}
                              field="timeFromNow"
                              type="number"
                              formatter={(val) => `${Math.abs(val).toFixed(1)} Years`}
                              isEditable={isCellEditable(rowIndex, "timeFromNow")} // Added conditional editability
                            />
                          </td>
                          <td className="p-3">
                            <EditableCell
                              value={row.passiveIncome}
                              rowId={row.id}
                              field="passiveIncome"
                              type="number"
                              formatter={formatCurrency}
                              isEditable={isCellEditable(rowIndex, "passiveIncome")} // Added conditional editability
                            />
                          </td>
                          <td className="p-3">
                            <div className="p-1 bg-gray-100 text-gray-700 rounded min-h-[24px] flex items-center">
                              {formatCurrency(row.passiveIncomeInflationAdjusted)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                                <div className="p-3 text-xs text-gray-500 border-t">
                  💡 Click any cell to edit. When you change one value, all related fields will automatically
                  recalculate.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goals Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  🎯 Set Your Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goalsWithAchievement.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${goal.color}`}></div>
                      <span className="text-sm font-medium text-gray-700">{goal.label}</span>
                      {goal.achieved && (
                        <Badge variant="secondary" className="text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={goal.amount}
                        onChange={(e) => handleGoalChange(goal.id, Number(e.target.value))}
                        className="text-sm"
                      />
                      {goal.achieved && (
                        <span className="text-xs text-gray-600">Age {goal.ageAchieved?.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
