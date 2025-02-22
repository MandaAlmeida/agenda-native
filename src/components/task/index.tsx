import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from "./styles"
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';

type ParticipantProps = {
    name: string;
    date: string;
    onRemove: () => void;
    id: string;
    handleTaskConclue: () => void;
    active: boolean;
    priority: string;
    category: string;
}

export function Task({ name, onRemove, id, handleTaskConclue, active, priority, category, date }: ParticipantProps) {

    return (
        <View style={[styles.container, {
            borderColor: priority === "Alta"
                ? "#FF3B30"
                : priority === "Media"
                    ? "#ff9500"
                    : "#34C759",
            backgroundColor: priority === 'Alta'
                ? 'rgba(255, 59, 48, 0.2)' : priority === 'Media'
                    ? 'rgba(255, 149, 0, 0.2)' :
                    'rgba(52, 199, 89, 0.2)'
        }]}>
            <TouchableOpacity style={styles.check} onPress={handleTaskConclue}>
                {active ? (
                    <View style={styles.containerCheck}>
                        <AntDesign style={[styles.conclude, {
                            backgroundColor: priority === "Alta"
                                ? "#FF3B30"
                                : priority === "Media"
                                    ? "#ff9500"
                                    : "#34C759"
                        }]} name="check" size={12} color="#F2F2F2" />
                        <View>
                            <Text id={id} style={styles.nameCheck}>{name}</Text>
                            <View style={styles.containerCategory}>
                                <Text id={id} style={styles.textCheck}>{category}</Text>
                                <Text style={styles.textCheck}> - </Text>
                                <Text style={styles.textCheck}>{date}</Text>
                            </View>

                        </View>
                    </View>
                ) : (
                    <View style={styles.containerCheck}>
                        <Text style={[styles.circle, {
                            borderColor: priority === "Alta"
                                ? "#FF3B30"
                                : priority === "Media"
                                    ? "#ff9500"
                                    : "#34C759"
                        }]}></Text>
                        <View>
                            <Text id={id} style={styles.name}>{name}</Text>
                            <View style={styles.containerCategory}>
                                <Text id={id} style={styles.text}>{category}</Text>
                                <Text style={styles.text}> - </Text>
                                <Text style={styles.text}>{date}</Text>
                            </View>
                        </View>
                    </View>
                )}

            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onRemove}>
                <Feather name="trash-2" size={14} color="#808080" />
            </TouchableOpacity>
        </View>
    )
}
