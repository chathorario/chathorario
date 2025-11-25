import React, { useState, useEffect } from 'react'
import { useData } from '@/context/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Intervalo {
  duracao: string
  aposAula: string
  showDuracaoInput: boolean
  duracaoInput: string
}

const Config: React.FC = () => {
  const { schoolConfig, saveSchoolConfig } = useData()
  const [isLoading, setIsLoading] = useState(false)

  const [modalidade, setModalidade] = useState('')
  const [turno, setTurno] = useState('')
  const [horarioInicio, setHorarioInicio] = useState('')
  const [duracaoAula, setDuracaoAula] = useState('')
  const [showDuracaoAulaInput, setShowDuracaoAulaInput] = useState(false)
  const [duracaoAulaInput, setDuracaoAulaInput] = useState('')
  const [quantidadeIntervalos, setQuantidadeIntervalos] = useState('0')
  const [intervalos, setIntervalos] = useState<Intervalo[]>([])

  useEffect(() => {
    if (schoolConfig) {
      setModalidade(schoolConfig.modalidade || '')
      setTurno(schoolConfig.turno || '')
      setHorarioInicio(schoolConfig.horario_inicio || '')

      const duracao = schoolConfig.duracao_aula || ''
      const duracoesPadrao = ['40', '45', '50', '55', '60']
      if (duracoesPadrao.includes(duracao)) {
        setDuracaoAula(duracao)
        setShowDuracaoAulaInput(false)
      } else if (duracao) {
        setDuracaoAula('outra')
        setShowDuracaoAulaInput(true)
        setDuracaoAulaInput(duracao)
      }

      const loadedIntervalos = schoolConfig.intervalos || []
      setQuantidadeIntervalos(loadedIntervalos.length.toString())
      setIntervalos(
        loadedIntervalos.map((i: any) => ({
          duracao: i.duracao,
          aposAula: i.aposAula,
          showDuracaoInput: i.showDuracaoInput || false,
          duracaoInput: i.duracaoInput || '',
        })),
      )
    }
  }, [schoolConfig])

  const getHorariosInicio = () => {
    if (!turno) return []

    let startHour: number
    let endHour: number

    if (['matutino', 'matutino-vespertino', 'integral'].includes(turno)) {
      startHour = 7
      endHour = 9
    } else if (['vespertino', 'vespertino-noturno'].includes(turno)) {
      startHour = 12
      endHour = 14
    } else if (turno === 'noturno') {
      startHour = 17
      endHour = 19
    } else {
      return []
    }

    const options = []
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = h.toString().padStart(2, '0')
        const minute = m.toString().padStart(2, '0')
        options.push(`${hour}:${minute}`)
      }
    }
    return options
  }

  const handleDuracaoChange = (value: string) => {
    setDuracaoAula(value)
    if (value === 'outra') {
      setShowDuracaoAulaInput(true)
    } else {
      setShowDuracaoAulaInput(false)
      setDuracaoAulaInput('')
    }
  }

  const handleQuantidadeIntervalosChange = (value: string) => {
    const numIntervalos = parseInt(value, 10)
    setQuantidadeIntervalos(value)
    setIntervalos(
      Array.from({ length: numIntervalos }, () => ({
        duracao: '',
        aposAula: '',
        showDuracaoInput: false,
        duracaoInput: '',
      })),
    )
  }

  const handleIntervaloChange = (
    index: number,
    field: keyof Intervalo,
    value: string,
  ) => {
    const newIntervalos = [...intervalos]
    const intervalo = newIntervalos[index]
    
    if (field === 'duracao') {
      intervalo.duracao = value
      if (value === 'outra') {
        intervalo.showDuracaoInput = true
      } else {
        intervalo.showDuracaoInput = false
        intervalo.duracaoInput = ''
      }
    } else {
      // @ts-ignore
      intervalo[field] = value
    }
    
    setIntervalos(newIntervalos)
  }

  const getAposAulaOptions = () => {
    const maxAulas = turno === 'integral' ? 10 : 5
    return Array.from({ length: maxAulas }, (_, i) => `Após a ${i + 1}ª aula`)
  }

  const handleSave = async () => {
    setIsLoading(true)
    const configData = {
      modalidade,
      turno,
      horario_inicio: horarioInicio,
      duracao_aula: duracaoAula === 'outra' ? duracaoAulaInput : duracaoAula,
      intervalos: intervalos.map((i) => ({
        duracao: i.duracao === 'outra' ? i.duracaoInput : i.duracao,
        aposAula: i.aposAula,
      })),
    }
    await saveSchoolConfig(configData)
    setIsLoading(false)
    // Adicionar feedback para o usuário, como um toast de sucesso
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais do Horário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="modalidade">Modalidade de Ensino</Label>
              <Select value={modalidade} onValueChange={setModalidade}>
                <SelectTrigger id="modalidade">
                  <SelectValue placeholder="Selecione a modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                  <SelectItem value="medio">Ensino Médio</SelectItem>
                  <SelectItem value="superior">Ensino Superior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="turno">Turno</Label>
              <Select value={turno} onValueChange={setTurno}>
                <SelectTrigger id="turno">
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matutino">Matutino</SelectItem>
                  <SelectItem value="vespertino">Vespertino</SelectItem>
                  <SelectItem value="noturno">Noturno</SelectItem>
                  <SelectItem value="matutino-vespertino">Matutino-Vespertino</SelectItem>
                  <SelectItem value="vespertino-noturno">Vespertino-Noturno</SelectItem>
                  <SelectItem value="integral">Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="horarioInicio">Horário de Início das Aulas</Label>
              <Select
                value={horarioInicio}
                onValueChange={setHorarioInicio}
                disabled={!turno}
              >
                <SelectTrigger id="horarioInicio">
                  <SelectValue placeholder="Selecione o horário de início" />
                </SelectTrigger>
                <SelectContent>
                  {getHorariosInicio().map((horario) => (
                    <SelectItem key={horario} value={horario}>
                      {horario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duracaoAula">Duração das Aulas (minutos)</Label>
              <Select value={duracaoAula} onValueChange={handleDuracaoChange}>
                <SelectTrigger id="duracaoAula">
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="40">40 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="50">50 min</SelectItem>
                  <SelectItem value="55">55 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="outra">Outra</SelectItem>
                </SelectContent>
              </Select>
              {showDuracaoAulaInput && (
                <Input
                  type="number"
                  placeholder="Digite a duração em minutos"
                  value={duracaoAulaInput}
                  onChange={(e) => setDuracaoAulaInput(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantidadeIntervalos">Quantidade de Intervalos</Label>
              <Select
                value={quantidadeIntervalos}
                onValueChange={handleQuantidadeIntervalosChange}
              >
                <SelectTrigger id="quantidadeIntervalos">
                  <SelectValue placeholder="Selecione a quantidade" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(6).keys()].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num === 0 ? 'Nenhum' : num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {intervalos.map((intervalo, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4"
              >
                <h3 className="text-lg font-semibold col-span-full">
                  Intervalo {index + 1}
                </h3>
                <div className="space-y-2">
                  <Label htmlFor={`duracaoIntervalo-${index}`}>
                    Duração do Intervalo (minutos)
                  </Label>
                  <Select
                    value={intervalo.duracao}
                    onValueChange={(value) =>
                      handleIntervaloChange(index, 'duracao', value)
                    }
                  >
                    <SelectTrigger id={`duracaoIntervalo-${index}`}>
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(18).keys()].map((i) => (
                        <SelectItem key={i} value={((i + 1) * 5).toString()}>
                          {(i + 1) * 5} min
                        </SelectItem>
                      ))}
                      <SelectItem value="outra">Outra</SelectItem>
                    </SelectContent>
                  </Select>
                  {intervalo.showDuracaoInput && (
                    <Input
                      type="number"
                      placeholder="Digite a duração"
                      value={intervalo.duracaoInput}
                      onChange={(e) =>
                        handleIntervaloChange(
                          index,
                          'duracaoInput',
                          e.target.value,
                        )
                      }
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`aposAula-${index}`}>Após qual aula?</Label>
                  <Select
                    value={intervalo.aposAula}
                    onValueChange={(value) =>
                      handleIntervaloChange(index, 'aposAula', value)
                    }
                  >
                    <SelectTrigger id={`aposAula-${index}`}>
                      <SelectValue placeholder="Selecione a aula" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAposAulaOptions().map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Config
