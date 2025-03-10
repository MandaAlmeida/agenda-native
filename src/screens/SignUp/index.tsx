import { Text, View, Image, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { InputForm } from "@/components/inputForm";
import { useRef } from "react";

import { AccountProps } from "@/@types/account";
import { useForm } from "react-hook-form";
import { Button } from "@/components/button";

import { styles } from "./styles";
import { theme } from '@/styles/theme';
import { Header } from "@/components/header";
import { useTask } from "@/hooks/useTask";

export function SignUp() {
    const { createUser } = useTask();
    const { control, handleSubmit, formState: { errors }, getValues } = useForm<AccountProps>();
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const passwordConfirmationRef = useRef<TextInput>(null);

    const { navigate } = useNavigation();

    function handleLogin() {
        navigate("signIn");
    }

    async function handleNextStep(data: AccountProps) {
        await createUser(data.name, data.email, data.password, data.passwordConfirmation);
    }


    function validationPasswordConfirmation(passwordConfirmation: string) {
        const { password } = getValues();

        return password === passwordConfirmation || "As senhas devem ser iguais"
    }

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.form}>
                <Text style={styles.title}>Acesse sua conta</Text>

                <InputForm
                    icon="user"
                    formProps={{
                        name: "name",
                        control,
                        rules: {
                            required: "Nome é obrigatório"
                        }
                    }}
                    inputProps={{
                        placeholder: "Nome",
                        placeholderTextColor: theme.gray2,
                        onSubmitEditing: () => emailRef.current?.focus(),
                        returnKeyType: "next",
                    }}
                    error={errors.name?.message}
                />
                <InputForm
                    ref={emailRef}
                    icon="mail"
                    formProps={{
                        name: "email",
                        control,
                        rules: {
                            required: "Email é obrigatório",
                            pattern: {
                                value: /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+$/i,
                                message: "E-mail inválido."
                            }
                        }
                    }}
                    inputProps={{
                        placeholder: "E-mail",
                        placeholderTextColor: theme.gray2,
                        onSubmitEditing: () => passwordRef.current?.focus(),
                    }}
                    error={errors.email?.message}
                />
                <InputForm
                    ref={passwordRef}
                    icon="lock"
                    formProps={{
                        name: "password",
                        control,
                        rules: {
                            required: "Senha é obrigatório",
                            minLength: {
                                value: 6,
                                message: "Senha deve ter pelo menos 6 digitos"
                            }
                        }
                    }}
                    inputProps={{
                        placeholder: "Senha",
                        placeholderTextColor: theme.gray2,
                        onSubmitEditing: () => passwordConfirmationRef.current?.focus(),
                        returnKeyType: "next",
                        secureTextEntry: true
                    }}
                    error={errors.password?.message}
                />
                <InputForm
                    ref={passwordConfirmationRef}
                    icon="lock"
                    formProps={{
                        name: "passwordConfirmation",
                        control,
                        rules: {
                            required: "Confirme a senha",
                            validate: validationPasswordConfirmation
                        }
                    }}
                    inputProps={{
                        placeholder: "Confirme sua senha",
                        placeholderTextColor: theme.gray2,
                        onSubmitEditing: handleSubmit(handleNextStep),
                        secureTextEntry: true
                    }}
                    error={errors.passwordConfirmation?.message}
                />

                <Button text="Criar conta" onPress={handleSubmit(handleNextStep)} style={{ minWidth: "100%", backgroundColor: theme.blue1 }} />
                <View style={styles.register}>
                    <Text style={styles.text}>Você ja possui uma conta?</Text>
                    <TouchableOpacity onPress={handleLogin}>
                        <Text style={styles.link}>Entrar na conta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}
