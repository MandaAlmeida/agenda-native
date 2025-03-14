import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from '@expo/vector-icons';
import { styles } from "./styles";
import { Input } from "@/components/input";
import { Priority } from "@/components/priority";
import { useForm } from "react-hook-form";
import { TaskProps } from "@/@types/task";
import { useTask } from "@/hooks/useTask";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Button } from "@/components/button";
import { theme } from "@/styles/theme";
import { SelectCategory } from "@/components/selectCategory";
import DateTimePicker from "@react-native-community/datetimepicker";

export function AddTask() {
    const { navigate } = useNavigation();
    const route = useRoute();
    const { dataTask } = route.params as { dataTask?: TaskProps };

    const { isDropdownOpen, category, setIsDropdownOpen, setTasks, handleAddTask, handleUpdateTask } = useTask();
    const isEditing = !!dataTask;

    const { control, handleSubmit, setValue, setError, clearErrors, formState: { errors }, trigger } = useForm<TaskProps>({
        defaultValues: {
            name: dataTask?.name || "",
            priority: dataTask?.priority || "Alta",
            category: dataTask?.category || "",
            date: dataTask?.date || new Date().toISOString(),
        }
    });


    // Estados para controle manual
    const [taskName, setTaskName] = useState(dataTask?.name || "");
    const [selectedCategory, setSelectedCategory] = useState(dataTask?.category || "Selecione");
    const [text, setText] = useState(dataTask?.priority || "Alta");
    const [date, setDate] = useState(dataTask ? new Date(dataTask.date) : new Date());
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        if (dataTask) {
            setValue("name", dataTask.name);
            setValue("priority", dataTask.priority);
            setValue("category", dataTask.category);
            setValue("date", dataTask.date);
        }
    }, [dataTask, setValue]);

    // Garante que a categoria seja validada ao ser selecionada
    useEffect(() => {
        setValue("category", selectedCategory);
        trigger("category"); // Dispara a validação manualmente
    }, [selectedCategory, setValue, trigger]);

    function handleChange(event: any, selectedDate?: Date) {
        setShowPicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    function handleBackToTask() {
        navigate("tasks");
    };

    function handleAddCategory() {
        navigate("addCategory");
    }

    function handleActivePriority(selectedPriority: string) {
        setText(selectedPriority);
    };

    function handleSelectCategory(categorySelecionada: string) {
        setSelectedCategory(categorySelecionada);
        setValue("category", categorySelecionada); // Atualiza no formulário
        clearErrors("category"); // Remove o erro se já estiver correto
    };


    async function handleSaveTask(data: TaskProps) {
        if (!data.category || data.category === "Selecione") {
            setError("category", { type: "manual", message: "Selecione uma categoria" });
            return;
        }

        clearErrors("category"); // Remove o erro se tudo estiver certo

        const task = {
            name: data.name,
            priority: text,
            category: selectedCategory,
            active: false,
            date: date.toISOString(),
        };


        if (isEditing) {
            handleUpdateTask({ ...dataTask, ...task }, handleBackToTask);
        } else {
            setTasks((prevTasks) => [...prevTasks, task]);
            handleAddTask(task, handleBackToTask);
        }

    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{isEditing ? "Editar tarefa" : "Adicionar uma nova tarefa"}</Text>
                <TouchableOpacity onPress={handleBackToTask}>
                    <Feather name="x" size={24} color={theme.gray2} />
                </TouchableOpacity>
            </View>

            <View style={{ gap: 20 }}>
                <Input
                    formProps={{
                        name: "name",
                        control,
                        rules: { required: "Nome é obrigatório" }
                    }}
                    inputProps={{
                        value: taskName,
                        placeholder: "Nome",
                        onChangeText: (text) => {
                            setTaskName(text);
                            setValue("name", text); // Sincroniza com o formulário
                        }
                    }}
                    error={errors.name?.message}
                />

                {/* Campo de Categoria */}
                <View style={{ position: "relative" }}>
                    {category.length > 1 ? (
                        <>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <Text style={styles.text}>
                                    Categoria: <Text style={{ color: theme.gray4 }}>{selectedCategory === "" ? "Selecione" : selectedCategory}</Text>
                                </Text>
                            </TouchableOpacity>
                            {isDropdownOpen && (
                                <SelectCategory selectedCategory={selectedCategory} setSelectedCategory={handleSelectCategory} isAddTask />
                            )}


                        </>
                    ) : (
                        <TouchableOpacity
                            style={styles.buttonAddCategory}
                            onPress={handleAddCategory}
                        >
                            <Text style={styles.text}>Adicionar categoria</Text>
                            <Feather name="plus" size={24} color={theme.blue1} />
                        </TouchableOpacity>
                    )}
                    {errors.category && <Text style={styles.error}>{errors.category.message}</Text>}

                </View>

                {/* Campo de Data */}
                <View>
                    <TouchableOpacity
                        onPress={() => setShowPicker(true)}
                        style={styles.button}
                    >
                        <Text style={styles.text}>Selecione a Data:</Text>
                        <Text style={styles.date}>{date.toLocaleDateString("pt-BR")}</Text>
                    </TouchableOpacity>

                    {showPicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={handleChange}
                        />
                    )}
                </View>

                {/* Prioridade */}
                <View style={styles.priority}>
                    <Text style={styles.text}>Prioridade</Text>
                    <Priority
                        text="Alta"
                        isFocus={text === "Alta"}
                        Focused={() => handleActivePriority("Alta")}
                    />
                    <Priority
                        text="Media"
                        isFocus={text === "Media"}
                        Focused={() => handleActivePriority("Media")}
                    />
                    <Priority
                        text="Baixa"
                        isFocus={text === "Baixa"}
                        Focused={() => handleActivePriority("Baixa")}
                    />
                </View>
            </View>

            {/* Botão de Adicionar/Salvar */}
            <Button
                text={isEditing ? "Salvar alterações" : "Adicionar tarefa"}
                onPress={handleSubmit(handleSaveTask)}
                style={{ width: "100%" }}
            />
        </View>
    );
}
